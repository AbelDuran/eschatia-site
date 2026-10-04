import {articleMetadata} from "@/lib/article-metadata";
import { notFound } from "next/navigation";
import { articleRecord, visible } from "@/lib/public-content";
import PublicArticle from "@/app/components/public-article";
export const dynamic="force-dynamic";
export async function generateMetadata({params}:{params:Promise<{kind:string;slug:string}>}){const {kind,slug}=await params;if(kind!=="news"&&kind!=="lore")return {};return articleMetadata(await articleRecord(kind,slug));}

export default async function ArticlePage({params}:{params:Promise<{kind:string;slug:string}>}) {const {kind,slug}=await params;if(kind!=="news"&&kind!=="lore")notFound();const article=await articleRecord(kind,slug);if(!article||!visible(article))notFound();return <PublicArticle article={article}/>;}

