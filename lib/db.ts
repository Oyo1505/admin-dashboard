export type SelectUser = {
  id:string 
  name:string
  email:string
  image:string
  accounts?:any
  sessions?: any
  role:'USER'| 'ADMIN'
}