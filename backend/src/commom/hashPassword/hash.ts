import bcrypt from 'bcrypt'

type ReturnHash = {
    success:boolean,
    hash:string,
}
export const hashPassword = async(password:string):Promise<ReturnHash>=>{
    try{
        const hash =  await bcrypt.hash(password,10)
        return {
            hash,
            success:true
        }
    }catch(err:unknown){
        return {
            success:false,
            hash:""
        }
    }
}