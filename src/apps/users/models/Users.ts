export interface User {
  id: number
  firstName: string
  lastName: string
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
