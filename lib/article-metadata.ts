import type {Metadata} from "next";
import type {Article} from "./models";
export function articleMetadata(a:Article|null):Metadata{
 if(!a||!['published','frozen'].includes(a.status))return {title:"Материал не найден",robots:{index:false,follow:false}};
 const title=a.title+" — ESCHATIA LA FRONTIER";const url="/"+a.kind+"/"+a.slug;const images=[{url:a.image||"/news-1.png",alt:a.title}];
 return {title,description:a.summary,alternates:{canonical:url},openGraph:{title,description:a.summary,url,siteName:"ESCHATIA LA FRONTIER",locale:"ru_RU",type:"article",images},twitter:{card:"summary_large_image",title,description:a.summary,images}};
}
