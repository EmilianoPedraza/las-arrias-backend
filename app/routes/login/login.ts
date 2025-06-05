import { Router } from "express";
import acces from "./access/access"
import successful from "./access/access-successful"
const loginIndex = Router()

loginIndex.use('/login', acces)
loginIndex.use('/login', successful)

export default loginIndex