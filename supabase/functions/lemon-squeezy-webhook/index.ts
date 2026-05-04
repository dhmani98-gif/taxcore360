import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-lemon-squeezy-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Verify Lemon Squeezy webhook signature
async function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signed = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(payload)
    );

    const expectedSignature = Array.from(new Uint8Array(signed))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return signature === expectedSignature;
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

// Map Lemon Squeezy product/variant to our subscription tiers
function mapProductToTier(productName: string, variantName: string): string {
  const name = (productName + " " + variantName).toLowerCase();
  
  if (name.includes("pay per form") || name.includes("pay-per-form")) {
    return "Pay Per Form";
  } else if (name.includes("professional") || name.includes("pro")) {
    return "Professional";
  } else if (name.includes("enterprise")) {
    return "Enterprise";
  }
  
  // Default to Pay Per Form if unknown
  return "Pay Per Form";
}

// Handle subscription_created event
async function handleSubscriptionCreated(
  supabase: any,
  data: any
): Promise<void> {
  const subscription = data.attributes;
  const customer = data.relationships?.customer?.data;
  
  if (!customer) {
    throw new Error("No customer data in subscription");
  }

  const tier = mapProductToTier(
    subscription.product_name || "",
    subscription.variant_name || ""
  );

  // Find user by email
  const { data: profiles, error: userError } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", customer.email)
    .limit(1);

  if (userError) {
    throw new Error(`Error finding user: ${userError.message}`);
  }

  if (!profiles || profiles.length === 0) {
    throw new Error(
      `No profile found for email ${customer.email}. User must sign up first so a profile exists.`
    );
  }

  const profile = profiles[0];

  const { error: upsertError } = await supabase
    .from("lemon_subscriptions")
    .upsert(
      {
        user_id: profile.id,
        tier,
        status: subscription.status === "active" ? "active" : "pending",
        lemon_squeezy_subscription_id: subscription.id,
        lemon_squeezy_customer_id: customer.id,
        current_period_start: subscription.created_at,
        current_period_end: subscription.renews_at,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

  if (upsertError) {
    throw new Error(`Error upserting lemon subscription: ${upsertError.message}`);
  }

  const { error: profileUpdateError } = await supabase
    .from("profiles")
    .update({ subscription_tier: tier, updated_at: new Date().toISOString() })
    .eq("id", profile.id);

  if (profileUpdateError) {
    console.error("Error updating profile subscription tier:", profileUpdateError);
  }
}

// Handle order_created event (for Pay Per Form purchases)
async function handleOrderCreated(
  supabase: any,
  data: any
): Promise<void> {
  const order = data.attributes;
  const customer = data.relationships?.customer?.data;
  
  if (!customer) {
    throw new Error("No customer data in order");
  }

  // For Pay Per Form, we might want to track form credits
  const tier = mapProductToTier(
    order.product_name || "",
    order.variant_name || ""
  );

  // Find user by email
  const { data: profiles, error: userError } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", customer.email)
    .limit(1);

  if (userError) {
    throw new Error(`Error finding user: ${userError.message}`);
  }

  if (profiles && profiles.length > 0) {
    const profile = profiles[0];

    // Log the order for tracking
    const { error: orderError } = await supabase.from("lemon_orders").insert({
      user_id: profile.id,
      order_id: data.id,
      product_name: order.product_name,
      variant_name: order.variant_name,
      tier: tier,
      status: order.status,
      total: order.total,
      created_at: order.created_at,
    });

    if (orderError) {
      console.error("Error logging order:", orderError);
    }

    // If this is a Pay Per Form order, add form credits
    if (tier === "Pay Per Form") {
      const { error: creditError } = await supabase.rpc("add_form_credits", {
        p_user_id: profile.id,
        p_credits: 5, // 5 forms per purchase
      });

      if (creditError) {
        console.error("Error adding form credits:", creditError);
      }
    }

    const { error: profileUpdateError } = await supabase
      .from("profiles")
      .update({ subscription_tier: tier, updated_at: new Date().toISOString() })
      .eq("id", profile.id);

    if (profileUpdateError) {
      console.error("Error updating profile subscription tier from order:", profileUpdateError);
    }
  }
}

// Handle subscription_updated event
async function handleSubscriptionUpdated(
  supabase: any,
  data: any
): Promise<void> {
  const subscription = data.attributes;
  
  const { error } = await supabase
    .from("lemon_subscriptions")
    .update({
      status: subscription.status === "active" ? "active" : "cancelled",
      current_period_end: subscription.renews_at,
      updated_at: new Date().toISOString(),
    })
    .eq("lemon_squeezy_subscription_id", subscription.id);

  if (error) {
    throw new Error(`Error updating subscription: ${error.message}`);
  }
}

// Handle subscription_cancelled event
async function handleSubscriptionCancelled(
  supabase: any,
  data: any
): Promise<void> {
  const subscription = data.attributes;
  
  const { error } = await supabase
    .from("lemon_subscriptions")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("lemon_squeezy_subscription_id", subscription.id);

  if (error) {
    throw new Error(`Error cancelling subscription: ${error.message}`);
  }
}

export default async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Only accept POST requests
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get signing secret from environment
    const signingSecret = Deno.env.get("LEMON_SQUEEZY_WEBHOOK_SECRET");
    if (!signingSecret) {
      console.error("LEMON_SQUEEZY_WEBHOOK_SECRET not set");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get signature from header
    const signature = req.headers.get("x-lemon-squeezy-signature");
    if (!signature) {
      return new Response(
        JSON.stringify({ error: "Missing signature header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get raw body
    const payload = await req.text();

    // Verify signature
    const isValid = await verifyWebhookSignature(payload, signature, signingSecret);
    if (!isValid) {
      console.error("Invalid webhook signature");
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse webhook data
    const webhookData = JSON.parse(payload);
    const eventName = webhookData.meta?.event_name;
    const data = webhookData.data;

    console.log(`Received webhook: ${eventName}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Supabase configuration missing" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      supabaseUrl, 
      supabaseServiceKey,
      {
        global: {
          headers: {
            'Connection': 'keep-alive'
          }
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false
        },
        db: {
          schema: 'public'
        }
      }
    );

    // Handle different event types
    switch (eventName) {
      case "subscription_created":
        await handleSubscriptionCreated(supabase, data);
        break;

      case "subscription_updated":
        await handleSubscriptionUpdated(supabase, data);
        break;

      case "subscription_cancelled":
        await handleSubscriptionCancelled(supabase, data);
        break;

      case "order_created":
        await handleOrderCreated(supabase, data);
        break;

      default:
        console.log(`Unhandled event type: ${eventName}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Webhook processed" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Webhook error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};
