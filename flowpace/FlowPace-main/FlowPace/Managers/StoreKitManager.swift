import Foundation
import StoreKit

@MainActor
class StoreKitManager: ObservableObject {
    @Published var isPro = false
    @Published var products: [Product] = []
    @Published var purchaseInProgress = false
    @Published var errorMessage: String?
    
    private let productIdentifiers = [
        "com.flowpace.pro.onetime",     // $9.99 CAD one-time purchase
        "com.flowpace.pro.monthly",      // $1.99 CAD/month subscription  
        "com.flowpace.pro.yearly"        // $7.99 CAD/year subscription
    ]
    
    // Pro features available to subscribers
    var proFeatures: [ProFeature] {
        [
            ProFeature(icon: "icloud.fill", title: "iCloud Sync", description: "Sync routines across all your Apple devices"),
            ProFeature(icon: "chart.line.uptrend.xyaxis", title: "Advanced Analytics", description: "Streaks, trends, and time-per-routine insights"),
            ProFeature(icon: "infinity", title: "Unlimited Routines", description: "Create as many routines as you need"),
            ProFeature(icon: "rectangle.stack.fill", title: "Routine Groups", description: "Organize routines into custom groups"),
            ProFeature(icon: "widget.small", title: "Home Screen Widgets", description: "Quick-start routines from your home screen")
        ]
    }
    private var updateListenerTask: Task<Void, Error>?
    
    init() {
        updateListenerTask = listenForTransactions()
        
        Task {
            await loadProducts()
            await updateProStatus()
        }
    }
    
    deinit {
        updateListenerTask?.cancel()
    }
    
    // MARK: - Product Loading
    
    @MainActor
    func loadProducts() async {
        do {
            products = try await Product.products(for: productIdentifiers)
        } catch {
            print("Failed to load products: \(error)")
            errorMessage = "Failed to load products: \(error.localizedDescription)"
        }
    }
    
    // MARK: - Purchase Management
    
    func purchasePro(productId: String) async {
        guard let proProduct = products.first(where: { $0.id == productId }) else {
            errorMessage = "Pro product not available"
            return
        }
        
        purchaseInProgress = true
        errorMessage = nil
        
        do {
            let result = try await proProduct.purchase()
            
            switch result {
            case .success(let verification):
                // Check whether the transaction is verified
                switch verification {
                case .verified(let transaction):
                    // Deliver content to the user
                    await deliverProFeatures(transaction: transaction)
                case .unverified(_, let error):
                    // Transaction failed verification
                    errorMessage = "Transaction verification failed: \(error.localizedDescription)"
                }
            case .userCancelled:
                errorMessage = "Purchase cancelled"
            case .pending:
                errorMessage = "Purchase pending approval"
            @unknown default:
                errorMessage = "Unknown purchase result"
            }
        } catch {
            errorMessage = "Purchase failed: \(error.localizedDescription)"
        }
        
        purchaseInProgress = false
    }
    
    func restorePurchases() async {
        purchaseInProgress = true
        errorMessage = nil
        
        do {
            try await AppStore.sync()
            await updateProStatus()
        } catch {
            errorMessage = "Failed to restore purchases: \(error.localizedDescription)"
        }
        
        purchaseInProgress = false
    }
    
    // MARK: - Transaction Handling
    
    private func deliverProFeatures(transaction: Transaction) async {
        // Update the user's pro status
        isPro = true
        UserDefaults.standard.set(true, forKey: "isPro")
        
        // Finish the transaction
        await transaction.finish()
    }
    
    private func listenForTransactions() -> Task<Void, Error> {
        return Task.detached {
            for await result in Transaction.updates {
                await self.handleTransactionUpdate(result)
            }
        }
    }
    
    private func handleTransactionUpdate(_ result: VerificationResult<Transaction>) async {
        switch result {
        case .verified(let transaction):
            // Deliver content to the user
            await deliverProFeatures(transaction: transaction)
        case .unverified(_, let error):
            // Transaction failed verification
            print("Transaction verification failed: \(error)")
        }
    }
    
    // MARK: - Pro Status Management
    
    private func updateProStatus() async {
        // Check if user has purchased pro version (one-time or subscription)
        for await result in Transaction.currentEntitlements {
            if case .verified(let transaction) = result {
                if productIdentifiers.contains(transaction.productID) {
                    isPro = true
                    UserDefaults.standard.set(true, forKey: "isPro")
                    return
                }
            }
        }
        
        // Check UserDefaults as fallback
        isPro = UserDefaults.standard.bool(forKey: "isPro")
    }
    
    // MARK: - Utility Methods
    
    func getProProduct(productId: String) -> Product? {
        products.first(where: { $0.id == productId })
    }
    
    func getProPrice(productId: String) -> String? {
        getProProduct(productId: productId)?.displayPrice
    }
    
    // Convenience methods for each product type
    func getOneTimeProduct() -> Product? {
        getProProduct(productId: "com.flowpace.pro.onetime")
    }
    
    func getMonthlyProduct() -> Product? {
        getProProduct(productId: "com.flowpace.pro.monthly")
    }
    
    func getYearlyProduct() -> Product? {
        getProProduct(productId: "com.flowpace.pro.yearly")
    }
    
    var canPurchasePro: Bool {
        !products.isEmpty && !purchaseInProgress
    }
    
    func getProFeaturesText() -> String {
        return proFeatures.map { "• \($0.title): \($0.description)" }.joined(separator: "\n")
    }
    
    // MARK: - Development/Testing
    
    #if DEBUG
    func simulateProPurchase() {
        isPro = true
        UserDefaults.standard.set(true, forKey: "isPro")
    }
    
    func simulateProRevocation() {
        isPro = false
        UserDefaults.standard.set(false, forKey: "isPro")
    }
    #endif
}

// MARK: - Pro Feature Model

struct ProFeature: Identifiable {
    let id = UUID()
    let icon: String
    let title: String
    let description: String
}

// MARK: - StoreKit Configuration (for testing)

extension StoreKitManager {
    func configureStoreKit() {
        // This would be used for StoreKit testing configuration
        // In production, this is handled automatically by the App Store
    }
}
