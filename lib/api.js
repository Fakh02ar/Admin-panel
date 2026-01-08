const API_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== "undefined" ? window.location.origin : "") + "/api"

export class ApiClient {
  static getAuthToken() {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token")
    }
    return null
  }

  static async request(endpoint, options = {}, retries = 3) {
    const token = this.getAuthToken()
    const headers = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    }

    const url = `${API_URL}${endpoint}`

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

        const response = await fetch(url, {
          ...options,
          headers,
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`)
        }

        return data
      } catch (error) {
        if (error.name === 'AbortError') {
          throw new Error("Request timeout - please check your connection and try again")
        }

        // If this is the last attempt, throw the error
        if (attempt === retries) {
          throw error
        }

        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
      }
    }
  }

  static async get(endpoint) {
    return this.request(endpoint, { method: "GET" })
  }

  static async post(endpoint, body) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    })
  }

  static async put(endpoint, body) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    })
  }

  static async delete(endpoint) {
    return this.request(endpoint, { method: "DELETE" })
  }
}
