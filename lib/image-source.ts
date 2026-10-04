import {getImageProps} from "next/image";
/** Local backgrounds keep their composition while using the image optimizer. */
export function imageSource(src:string,width=640,height=480){return src.startsWith("/")&&!src.startsWith("//")?getImageProps({src,width,height,alt:""}).props.src:src;}
