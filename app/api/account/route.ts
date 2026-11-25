import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { deleteAccount } from "@/lib/account-deletion";

export async function DELETE() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await deleteAccount(userId);
    return NextResponse.json({ deleted: true });
  } catch (err) {
    console.error(`Account deletion failed for ${userId}:`, err);
    return NextResponse.json({ error: "Could not delete your account. Please try again or contact support." }, { status: 500 });
  }
}
