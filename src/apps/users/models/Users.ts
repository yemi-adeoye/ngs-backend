export interface User {
  [key: string]: any
  id: number
  firstName: string
  lastName: string
  username: string
  email: string
  dob: Date
  sex: number
  password: String
  isActive: boolean
  isSuspended: boolean
  lastSuccessfulLogin: Date
  lastUnsuccessfulLogin: Date
  invalidLoginCount: number
}
