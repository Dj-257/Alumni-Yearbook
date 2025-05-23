import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import UserPreference from "@/app/models/UserPreference";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDatabase();

    // Find the user preference
    const userPreference = await UserPreference.findOne({
      email: session.user.email,
    });

    if (userPreference) {
      // Return all relevant fields including linkedinProfile
      return NextResponse.json({
        photoUrl: userPreference.photoUrl || "",
        number: userPreference.number || "",
        linkedinProfile: userPreference.linkedinProfile || "", // Ensure this field is included
      });
    } else {
      // User has no preferences yet
      return NextResponse.json({
        photoUrl: "",
        number: "",
        linkedinProfile: "",
      });
    }
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    return NextResponse.json(
      { message: "Error fetching user preferences", error: (error as Error).message },
      { status: 500 }
    );
  }
}