import {test} from "node:test";
import assert from "node:assert/strict";
import {articleMetadata} from "../lib/article-metadata";
import type {Article} from "../lib/models";
test("previews describe the material and never disclose hidden titles",()=>{
 const a={kind:"characters",slug:"abel",title:"Абель",summary:"Описание",image:"/abel.png",status:"published"} as Article;
 const m=articleMetadata(a);assert.equal(m.alternates?.canonical,"/characters/abel");assert.equal(m.description,"Описание");assert.equal(m.openGraph?.title,"Абель — ESCHATIA LA FRONTIER");
 for(const status of ["draft","deleted"] as const){const hidden=articleMetadata({...a,status});assert.equal(hidden.openGraph,undefined);assert(!JSON.stringify(hidden).includes("Абель"));}
});
