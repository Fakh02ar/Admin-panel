"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ApiClient } from "@/lib/api"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  })
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Validation
      if (!loginData.email || !loginData.password) {
        setError("Please fill in all fields")
        setLoading(false)
        return
      }

      const data = await ApiClient.post("/auth/login", loginData)

      if (data.success) {
        // Store token and user info
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))

        // Redirect to dashboard
        router.push("/dashboard")
      }
    } catch (err) {
      setError(err.message || "Invalid credentials. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Validation
      if (!registerData.name || !registerData.email || !registerData.password || !registerData.confirmPassword) {
        setError("Please fill in all fields")
        setLoading(false)
        return
      }

      if (registerData.password !== registerData.confirmPassword) {
        setError("Passwords do not match")
        setLoading(false)
        return
      }

      if (registerData.password.length < 6) {
        setError("Password must be at least 6 characters long")
        setLoading(false)
        return
      }

      const data = await ApiClient.post("/auth/register", {
        name: registerData.name,
        email: registerData.email,
        password: registerData.password,
      })

      if (data.success) {
        // Store token and user info
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))

        // Redirect to dashboard
        router.push("/dashboard")
      }
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    })
  }

  const handleRegisterChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground text-xl font-bold">A</span>
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Admin Panel</CardTitle>
          <CardDescription className="text-center">Login or register to access the admin panel</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    name="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    disabled={loading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    disabled={loading}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="register-name">Full Name</Label>
                  <Input
                    id="register-name"
                    name="name"
                    type="text"
                    placeholder="username"
                    value={registerData.name}
                    onChange={handleRegisterChange}
                    disabled={loading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    name="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={registerData.email}
                    onChange={handleRegisterChange}
                    disabled={loading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <Input
                    id="register-password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={registerData.password}
                    onChange={handleRegisterChange}
                    disabled={loading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-confirm-password">Confirm Password</Label>
                  <Input
                    id="register-confirm-password"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={registerData.confirmPassword}
                    onChange={handleRegisterChange}
                    disabled={loading}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
