import Home from "./components/home";
import { homeData } from "@/lib/public-content";
export const dynamic = "force-dynamic";
export default async function HomePage(){return <Home {...await homeData()}/>;}
