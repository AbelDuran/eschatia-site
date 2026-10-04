import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
export const metadata:Metadata={title:"Управление — ESCHATIA LA FRONTIER",robots:{index:false,follow:false}};
export const dynamic="force-dynamic";
export default async function AdminLayout({children}:{children:React.ReactNode}) {const user=await currentUser();if(!user||user.role==="player")redirect("/account");return children;}

