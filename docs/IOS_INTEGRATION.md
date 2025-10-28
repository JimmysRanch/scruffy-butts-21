# iOS Integration Guide

Complete guide for integrating the Scruffy Butts backend with a native iOS app using Swift and the official `supabase-swift` client.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Authentication](#authentication)
6. [Data Access](#data-access)
7. [Storage](#storage)
8. [Realtime Subscriptions](#realtime-subscriptions)
9. [Deep Links](#deep-links)
10. [Security Best Practices](#security-best-practices)
11. [App Store Readiness](#app-store-readiness)
12. [Troubleshooting](#troubleshooting)

## Overview

The iOS app connects to the same Supabase backend as the web app, sharing:
- Database schema and RLS policies
- Authentication system
- Storage buckets
- Edge Functions
- Realtime subscriptions

### Architecture

```
┌────────────────────────────┐
│     iOS App (SwiftUI)      │
│                            │
│  ┌──────────────────────┐  │
│  │  supabase-swift      │  │
│  │  Client Library      │  │
│  └──────────┬───────────┘  │
│             │              │
└─────────────┼──────────────┘
              │
              │ HTTPS
              ▼
┌─────────────────────────────┐
│   Supabase Backend          │
│   (tuwkdsoiltdboiaghztz)    │
└─────────────────────────────┘
```

## Prerequisites

- Xcode 15.0 or later
- iOS 15.0+ deployment target
- Swift 5.9+
- CocoaPods or Swift Package Manager
- Supabase project credentials

## Installation

### Swift Package Manager (Recommended)

1. Open your Xcode project
2. Go to **File → Add Packages**
3. Enter the repository URL:
   ```
   https://github.com/supabase-community/supabase-swift
   ```
4. Select version: `2.0.0` or later
5. Add to your app target

### CocoaPods

Add to your `Podfile`:

```ruby
pod 'Supabase', '~> 2.0'
```

Then run:
```bash
pod install
```

## Configuration

### 1. Create Supabase Configuration File

Create `SupabaseClient.swift`:

```swift
import Foundation
import Supabase

class SupabaseClient {
    static let shared = SupabaseClient()
    
    let client: SupabaseClient
    
    private init() {
        guard let url = URL(string: "https://tuwkdsoiltdboiaghztz.supabase.co"),
              let anonKey = Bundle.main.infoDictionary?["SUPABASE_ANON_KEY"] as? String else {
            fatalError("Supabase configuration missing. Check Info.plist")
        }
        
        client = SupabaseClient(
            supabaseURL: url,
            supabaseKey: anonKey,
            options: SupabaseClientOptions(
                auth: AuthClientOptions(
                    autoRefreshToken: true,
                    persistSession: true,
                    storage: KeychainStorage() // Custom implementation below
                )
            )
        )
    }
}
```

### 2. Secure Configuration in Info.plist

**IMPORTANT**: Never hardcode keys in source code!

Add to `Info.plist`:

```xml
<key>SUPABASE_URL</key>
<string>https://tuwkdsoiltdboiaghztz.supabase.co</string>
<key>SUPABASE_ANON_KEY</key>
<string>$(SUPABASE_ANON_KEY)</string>
```

### 3. Use Xcode Build Configuration

Create a `Config.xcconfig` file:

```
SUPABASE_ANON_KEY = your_actual_anon_key_here
```

Add to `.gitignore`:
```
*.xcconfig
Config.xcconfig
```

### 4. Implement Secure Keychain Storage

Create `KeychainStorage.swift`:

```swift
import Foundation
import Supabase

/// Secure session storage using iOS Keychain
class KeychainStorage: AuthStorage {
    private let service = "com.scruffybutts.app.auth"
    private let account = "session"
    
    func getSession() async throws -> Session? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
            kSecReturnData as String: true
        ]
        
        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)
        
        guard status == errSecSuccess,
              let data = result as? Data else {
            return nil
        }
        
        return try JSONDecoder().decode(Session.self, from: data)
    }
    
    func storeSession(_ session: Session) async throws {
        let data = try JSONEncoder().encode(session)
        
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
            kSecValueData as String: data
        ]
        
        // Delete existing item first
        SecItemDelete(query as CFDictionary)
        
        let status = SecItemAdd(query as CFDictionary, nil)
        guard status == errSecSuccess else {
            throw NSError(domain: "Keychain", code: Int(status))
        }
    }
    
    func deleteSession() async throws {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account
        ]
        
        SecItemDelete(query as CFDictionary)
    }
}
```

## Authentication

### Sign Up

```swift
func signUp(email: String, password: String) async throws -> User {
    let response = try await SupabaseClient.shared.client.auth.signUp(
        email: email,
        password: password
    )
    
    // Create profile
    if let user = response.user {
        try await createUserProfile(userId: user.id, email: email)
    }
    
    return response.user
}

private func createUserProfile(userId: UUID, email: String) async throws {
    let profile = [
        "id": userId.uuidString,
        "email": email,
        "role": "customer"
    ]
    
    try await SupabaseClient.shared.client
        .from("profiles")
        .insert(profile)
        .execute()
}
```

### Sign In with Email/Password

```swift
func signIn(email: String, password: String) async throws -> Session {
    let session = try await SupabaseClient.shared.client.auth.signIn(
        email: email,
        password: password
    )
    
    return session
}
```

### Sign In with Magic Link

```swift
func signInWithMagicLink(email: String) async throws {
    try await SupabaseClient.shared.client.auth.signInWithOTP(
        email: email,
        redirectTo: URL(string: "scruffybutts://auth/callback")
    )
}
```

### Sign Out

```swift
func signOut() async throws {
    try await SupabaseClient.shared.client.auth.signOut()
}
```

### Check Auth State

```swift
func getCurrentUser() async -> User? {
    return SupabaseClient.shared.client.auth.currentUser
}

func isAuthenticated() -> Bool {
    return SupabaseClient.shared.client.auth.currentSession != nil
}
```

### Monitor Auth State Changes

```swift
class AuthViewModel: ObservableObject {
    @Published var currentUser: User?
    @Published var isAuthenticated = false
    
    private var authStateTask: Task<Void, Never>?
    
    init() {
        observeAuthState()
    }
    
    func observeAuthState() {
        authStateTask = Task {
            for await state in SupabaseClient.shared.client.auth.authStateChanges {
                await MainActor.run {
                    self.currentUser = state.session?.user
                    self.isAuthenticated = state.session != nil
                }
            }
        }
    }
    
    deinit {
        authStateTask?.cancel()
    }
}
```

## Data Access

### Fetch Data with RLS

```swift
struct Appointment: Codable, Identifiable {
    let id: UUID
    let customerId: UUID
    let petId: UUID
    let serviceId: UUID
    let appointmentDate: String
    let startTime: String
    let status: String
    let price: Decimal
    
    enum CodingKeys: String, CodingKey {
        case id
        case customerId = "customer_id"
        case petId = "pet_id"
        case serviceId = "service_id"
        case appointmentDate = "appointment_date"
        case startTime = "start_time"
        case status
        case price
    }
}

func fetchMyAppointments() async throws -> [Appointment] {
    let appointments: [Appointment] = try await SupabaseClient.shared.client
        .from("appointments")
        .select()
        .order("appointment_date", ascending: false)
        .execute()
        .value
    
    return appointments
}
```

### Insert Data

```swift
func createCustomer(
    firstName: String,
    lastName: String,
    email: String,
    phone: String
) async throws -> UUID {
    struct NewCustomer: Encodable {
        let firstName: String
        let lastName: String
        let email: String
        let phone: String
        
        enum CodingKeys: String, CodingKey {
            case firstName = "first_name"
            case lastName = "last_name"
            case email
            case phone
        }
    }
    
    let customer = NewCustomer(
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: phone
    )
    
    let response: [Customer] = try await SupabaseClient.shared.client
        .from("customers")
        .insert(customer)
        .select()
        .single()
        .execute()
        .value
    
    return response.id
}
```

### Update Data

```swift
func updateAppointmentStatus(
    appointmentId: UUID,
    status: String
) async throws {
    struct StatusUpdate: Encodable {
        let status: String
    }
    
    try await SupabaseClient.shared.client
        .from("appointments")
        .update(StatusUpdate(status: status))
        .eq("id", value: appointmentId.uuidString)
        .execute()
}
```

### Delete Data

```swift
func deletePet(petId: UUID) async throws {
    try await SupabaseClient.shared.client
        .from("pets")
        .delete()
        .eq("id", value: petId.uuidString)
        .execute()
}
```

### Complex Queries

```swift
func fetchCustomerWithPets(customerId: UUID) async throws -> CustomerDetail {
    struct CustomerDetail: Codable {
        let id: UUID
        let firstName: String
        let lastName: String
        let email: String
        let pets: [Pet]
        
        enum CodingKeys: String, CodingKey {
            case id
            case firstName = "first_name"
            case lastName = "last_name"
            case email
            case pets
        }
    }
    
    let customer: CustomerDetail = try await SupabaseClient.shared.client
        .from("customers")
        .select("*, pets(*)")
        .eq("id", value: customerId.uuidString)
        .single()
        .execute()
        .value
    
    return customer
}
```

## Storage

### Upload File

```swift
func uploadPetPhoto(
    petId: UUID,
    image: UIImage
) async throws -> String {
    guard let imageData = image.jpegData(compressionQuality: 0.8) else {
        throw NSError(domain: "Image", code: -1)
    }
    
    let fileName = "\(petId.uuidString).jpg"
    
    let path = try await SupabaseClient.shared.client.storage
        .from("pet-photos")
        .upload(
            path: fileName,
            file: imageData,
            options: FileOptions(
                contentType: "image/jpeg"
            )
        )
    
    return path
}
```

### Download File

```swift
func downloadPetPhoto(fileName: String) async throws -> UIImage {
    let data = try await SupabaseClient.shared.client.storage
        .from("pet-photos")
        .download(path: fileName)
    
    guard let image = UIImage(data: data) else {
        throw NSError(domain: "Image", code: -2)
    }
    
    return image
}
```

### Get Public URL

```swift
func getPetPhotoURL(fileName: String) -> URL {
    return SupabaseClient.shared.client.storage
        .from("pet-photos")
        .getPublicURL(path: fileName)
}
```

### Delete File

```swift
func deletePetPhoto(fileName: String) async throws {
    try await SupabaseClient.shared.client.storage
        .from("pet-photos")
        .remove(paths: [fileName])
}
```

## Realtime Subscriptions

### Subscribe to Table Changes

```swift
class AppointmentsViewModel: ObservableObject {
    @Published var appointments: [Appointment] = []
    private var subscription: Task<Void, Never>?
    
    func subscribeToAppointments() {
        subscription = Task {
            let channel = await SupabaseClient.shared.client.realtime
                .channel("appointments")
            
            await channel
                .on(.postgresChanges(
                    InsertAction.self,
                    schema: "public",
                    table: "appointments"
                )) { [weak self] payload in
                    if let appointment = payload.new {
                        await MainActor.run {
                            self?.appointments.append(appointment)
                        }
                    }
                }
                .on(.postgresChanges(
                    UpdateAction.self,
                    schema: "public",
                    table: "appointments"
                )) { [weak self] payload in
                    if let updated = payload.new {
                        await MainActor.run {
                            if let index = self?.appointments.firstIndex(where: { $0.id == updated.id }) {
                                self?.appointments[index] = updated
                            }
                        }
                    }
                }
                .subscribe()
        }
    }
    
    func unsubscribe() {
        subscription?.cancel()
        Task {
            await SupabaseClient.shared.client.realtime.removeAllChannels()
        }
    }
    
    deinit {
        unsubscribe()
    }
}
```

## Deep Links

### Configure URL Scheme

1. In Xcode, select your target
2. Go to **Info** tab
3. Add URL Type:
   - Identifier: `com.scruffybutts.app`
   - URL Schemes: `scruffybutts`

### Configure Universal Links

Add to `Info.plist`:

```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>scruffybutts</string>
        </array>
    </dict>
</array>
```

Add Associated Domains capability:
```
applinks:tuwkdsoiltdboiaghztz.supabase.co
```

### Handle Auth Callbacks

In your `AppDelegate` or `SceneDelegate`:

```swift
func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey : Any] = [:]
) -> Bool {
    Task {
        do {
            try await SupabaseClient.shared.client.auth.session(from: url)
        } catch {
            print("Auth callback error: \(error)")
        }
    }
    return true
}
```

## Security Best Practices

### ✅ DO

1. **Use Keychain for Session Storage**
   - Never use UserDefaults for auth tokens
   - Implement `KeychainStorage` as shown above

2. **Environment-Based Configuration**
   - Use `.xcconfig` files for environment variables
   - Never commit API keys to git

3. **Certificate Pinning** (Optional but recommended)
   ```swift
   // Add SSL pinning for production
   ```

4. **Enable App Transport Security (ATS)**
   ```xml
   <key>NSAppTransportSecurity</key>
   <dict>
       <key>NSAllowsArbitraryLoads</key>
       <false/>
   </dict>
   ```

5. **Biometric Authentication**
   ```swift
   import LocalAuthentication
   
   func authenticateWithBiometrics() async -> Bool {
       let context = LAContext()
       var error: NSError?
       
       guard context.canEvaluatePolicy(
           .deviceOwnerAuthenticationWithBiometrics,
           error: &error
       ) else {
           return false
       }
       
       do {
           return try await context.evaluatePolicy(
               .deviceOwnerAuthenticationWithBiometrics,
               localizedReason: "Access your grooming appointments"
           )
       } catch {
           return false
       }
   }
   ```

### ❌ DON'T

1. **Never hardcode API keys in source code**
2. **Never use the service role key in the app**
3. **Don't store sensitive data in UserDefaults**
4. **Don't disable ATS in production**
5. **Don't log sensitive information**

## App Store Readiness Checklist

### Code & Configuration

- [ ] Remove all hardcoded API keys
- [ ] Use `.xcconfig` for environment variables
- [ ] Implement Keychain storage for sessions
- [ ] Enable App Transport Security (ATS)
- [ ] Remove debug logging in production
- [ ] Code signing configured
- [ ] Provisioning profiles set up

### Privacy & Compliance

- [ ] Privacy Policy added
- [ ] Terms of Service added
- [ ] Privacy Manifest (PrivacyInfo.xcprivacy) created
- [ ] Required permissions explained (Camera, Photo Library)
- [ ] Data collection disclosed
- [ ] Third-party SDKs disclosed (Supabase)

### App Store Connect

- [ ] App icons (all sizes)
- [ ] Screenshots for all device sizes
- [ ] App description
- [ ] Keywords
- [ ] Age rating
- [ ] App category
- [ ] Support URL
- [ ] Privacy Policy URL

### Testing

- [ ] TestFlight beta testing completed
- [ ] All features tested on real devices
- [ ] Edge cases handled
- [ ] Offline behavior tested
- [ ] Auth flows tested (sign up, sign in, sign out)
- [ ] RLS policies verified
- [ ] Performance tested

### Supabase Configuration

- [ ] Production URL configured
- [ ] Auth redirect URLs set in Supabase dashboard
- [ ] Storage policies configured
- [ ] Rate limits appropriate
- [ ] Email templates customized
- [ ] SMTP configured for production emails

## Troubleshooting

### Common Issues

#### 1. "Session not found"

**Problem**: User session not persisting between app launches.

**Solution**: Ensure Keychain storage is implemented correctly.

```swift
// Verify Keychain access
let query: [String: Any] = [
    kSecClass as String: kSecClassGenericPassword,
    kSecAttrService as String: "com.scruffybutts.app.auth"
]
let status = SecItemCopyMatching(query as CFDictionary, nil)
print("Keychain status: \(status)") // Should be 0 (errSecSuccess)
```

#### 2. "RLS policy violation"

**Problem**: Cannot access data despite being authenticated.

**Solution**: Check user role and RLS policies.

```swift
// Verify user is authenticated
let user = await SupabaseClient.shared.client.auth.currentUser
print("User ID: \(user?.id)")
print("User role: \(user?.userMetadata?["role"])")

// Check profile
let profile = try await SupabaseClient.shared.client
    .from("profiles")
    .select()
    .eq("id", value: user!.id.uuidString)
    .single()
    .execute()
    .value
```

#### 3. "Deep link not working"

**Problem**: Auth callback URL not being handled.

**Solution**: Verify URL scheme configuration and implement handler.

```swift
// Add to AppDelegate
func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey : Any] = [:]
) -> Bool {
    print("Received URL: \(url)")
    // Handle auth callback
    return true
}
```

#### 4. "File upload fails"

**Problem**: Cannot upload images to storage.

**Solution**: Check storage policies and file size.

```swift
// Verify bucket exists and has correct policies
// Check file size (max 50MB by default)
let maxSize = 50 * 1024 * 1024 // 50MB
if imageData.count > maxSize {
    // Compress more or show error
}
```

### Debug Logging

Enable detailed logging for troubleshooting:

```swift
// Add to SupabaseClient initialization
#if DEBUG
    .logger(Logger(label: "supabase", logLevel: .debug))
#endif
```

### Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **supabase-swift GitHub**: https://github.com/supabase-community/supabase-swift
- **Supabase Discord**: https://discord.supabase.com
- **Stack Overflow**: Tag `supabase` + `swift`

## Example SwiftUI Views

### Login View

```swift
struct LoginView: View {
    @StateObject private var authViewModel = AuthViewModel()
    @State private var email = ""
    @State private var password = ""
    @State private var isLoading = false
    @State private var errorMessage: String?
    
    var body: some View {
        VStack(spacing: 20) {
            Text("Scruffy Butts")
                .font(.largeTitle)
                .bold()
            
            TextField("Email", text: $email)
                .textContentType(.emailAddress)
                .autocapitalization(.none)
                .textFieldStyle(.roundedBorder)
            
            SecureField("Password", text: $password)
                .textContentType(.password)
                .textFieldStyle(.roundedBorder)
            
            if let error = errorMessage {
                Text(error)
                    .foregroundColor(.red)
                    .font(.caption)
            }
            
            Button(action: signIn) {
                if isLoading {
                    ProgressView()
                } else {
                    Text("Sign In")
                }
            }
            .buttonStyle(.borderedProminent)
            .disabled(isLoading)
        }
        .padding()
    }
    
    func signIn() {
        isLoading = true
        errorMessage = nil
        
        Task {
            do {
                _ = try await authViewModel.signIn(email: email, password: password)
            } catch {
                await MainActor.run {
                    errorMessage = error.localizedDescription
                }
            }
            await MainActor.run {
                isLoading = false
            }
        }
    }
}
```

### Appointments List View

```swift
struct AppointmentsView: View {
    @StateObject private var viewModel = AppointmentsViewModel()
    
    var body: some View {
        NavigationView {
            List(viewModel.appointments) { appointment in
                AppointmentRow(appointment: appointment)
            }
            .navigationTitle("Appointments")
            .task {
                await viewModel.fetchAppointments()
                viewModel.subscribeToAppointments()
            }
        }
    }
}

struct AppointmentRow: View {
    let appointment: Appointment
    
    var body: some View {
        VStack(alignment: .leading) {
            Text(appointment.petName)
                .font(.headline)
            Text(appointment.appointmentDate)
                .font(.subheadline)
            Text(appointment.status)
                .font(.caption)
                .foregroundColor(statusColor)
        }
    }
    
    var statusColor: Color {
        switch appointment.status {
        case "scheduled": return .blue
        case "in-progress": return .orange
        case "completed": return .green
        default: return .gray
        }
    }
}
```

## Next Steps

1. **Implement Authentication Flow**
   - Create login/signup screens
   - Add auth state management
   - Implement secure storage

2. **Build Core Features**
   - Appointments list and detail
   - Customer/pet management
   - Profile settings

3. **Add Offline Support**
   - Local Core Data caching
   - Sync when online
   - Conflict resolution

4. **Enhance UX**
   - Loading states
   - Error handling
   - Pull to refresh
   - Animations

5. **Test Thoroughly**
   - Unit tests
   - Integration tests
   - TestFlight beta
   - Real device testing

6. **Prepare for Release**
   - Complete App Store checklist
   - Submit for review
   - Monitor crash reports
   - Iterate based on feedback

---

For questions or issues, please refer to the [Supabase documentation](https://supabase.com/docs) or reach out to the development team.
