import {NextResponse} from "next/server"; import {isAdmin} from "@/lib/admin";
/**
 * Safe placeholder for official Instagram integration.
 * Do not automate Instagram login or store Instagram passwords.
 * When the Meta API is configured and the account/app is eligible,
 * implement the official Content Publishing flow here.
 */
export async function POST(req:Request){
  if(!(await isAdmin())) return NextResponse.json({error:"Unauthorized"},{status:401});
  if(process.env.INSTAGRAM_ENABLED !== "true") return NextResponse.json({error:"Instagram publishing is not configured. Generate/download the Story image and publish it manually."},{status:501});
  return NextResponse.json({error:"Official Meta publishing adapter is intentionally left unconfigured until your Meta app permissions and account eligibility are confirmed."},{status:501});
}