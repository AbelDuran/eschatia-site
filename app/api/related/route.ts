import { relatedPages } from "@/lib/related";
export async function GET(request:Request){const path=new URL(request.url).searchParams.get("path")||"/";if(path.length>180)return Response.json([],{status:400});return Response.json(await relatedPages(path),{headers:{"Cache-Control":"no-store"}});}

