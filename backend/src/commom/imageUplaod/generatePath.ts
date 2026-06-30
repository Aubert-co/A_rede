import { randomUUID } from "crypto"
import { extname } from "path"

export const generatePath = (originalName?:string) =>{
    if(!originalName)return{
        id:"",
        extension:""
    }
    
    return {
        id:randomUUID(),
        extension:extname(originalName)
    }
};
