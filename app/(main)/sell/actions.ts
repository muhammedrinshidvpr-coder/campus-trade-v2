"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

type CreateItemInput = {
  title: string;
  description: string;
  price: number;
  image_url: string; // ADDED: New field for the image link
};

type CreateItemResult = {
  success?: boolean;
  error?: string;
};

export async function createItemAction(
  input: CreateItemInput,
): Promise<CreateItemResult> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    // 1. Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "You must be logged in to create a listing" };
    }

    // 2. Validate input
    if (input.title.length < 3 || input.title.length > 200) {
      return { error: "Title must be between 3 and 200 characters" };
    }

    if (input.description.length < 10) {
      return { error: "Description must be at least 10 characters" };
    }

    if (input.price <= 0) {
      return { error: "Price must be greater than 0" };
    }

    // NEW: Ensure an image was actually provided
    if (!input.image_url) {
      return { error: "An image is required for the listing" };
    }

    // 3. Check if user profile exists
    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("id")
      .eq("id", user.id)
      .single();

    if (profileError || !userProfile) {
      return {
        error: "Please complete your profile before creating a listing",
      };
    }

    // 4. Insert the item
    const { data: newItem, error: insertError } = await supabase
      .from("items")
      .insert({
        title: input.title,
        description: input.description,
        price: input.price,
        image_url: input.image_url, // ADDED: Save the image URL to the database
        seller_id: user.id,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Database error:", insertError);
      return { error: "Failed to create listing. Please try again." };
    }

    // 5. Revalidate the marketplace page to show the new item
    revalidatePath("/marketplace");

    return { success: true };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { error: "An unexpected error occurred" };
  }
}
