import { Router } from 'express'
import { userService } from '../services/UserService'

export const testRouter = Router()
const max = 15000

export const loadFollows = () => {
  console.log('writing user follows')
  for (let i = 5001; i <= max; i++) {
    userService.followUser(2, i)
  }
  console.log('done!')
}

testRouter.get('/follows', (req: any, res: any) => {
  loadFollows()
  return res.send('done')
})
