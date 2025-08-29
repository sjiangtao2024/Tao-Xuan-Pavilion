/**
 * 英文翻译文件
 */

window.translations_en = {
    // Website basic info
    siteName: 'Tao Xuan Pavilion',
    
    // Navigation menu
    navHome: 'Home',
    navShop: 'All Artifacts',
    navAbout: 'About Us',
    navContact: 'Contact Us',
    
    // User authentication
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    profile: 'Profile',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    forgotPassword: 'Forgot Password?',
    orLoginWith: 'Or login with email',
    
    // Shopping cart
    cart: 'Cart',
    addToCart: 'Add to Cart',
    removeFromCart: 'Remove',
    quantity: 'Quantity',
    totalPrice: 'Total Price',
    checkout: 'Checkout',
    cartEmpty: 'Your cart is empty',
    
    // Product related
    products: 'Artifacts',
    productName: 'Artifact Name',
    productPrice: 'Price',
    productDescription: 'Description',
    productDetails: 'Details',
    featuredProducts: 'Featured Artifacts',
    allProducts: 'All Artifacts',
    searchProducts: 'Search Artifacts',
    categories: 'Categories',
    
    // Page content
    welcomeTitle: 'Welcome to Tao Xuan Pavilion',
    welcomeSubtitle: 'Discover Ancient Taoist Treasures',
    welcomeDescription: 'Here you will find ancient artifacts imbued with mystical powers, each carrying thousands of years of Taoist heritage.',
    
    // About us page
    aboutTitle: 'About Tao Xuan Pavilion',
    aboutMission: 'Our Mission',
    aboutMissionText: 'Tao Xuan Pavilion is dedicated to preserving and protecting ancient Taoist culture, providing practitioners with authentic artifacts and tools. Every artifact is carefully selected and verified to ensure its quality and spiritual essence.',
    aboutHistory: 'Historical Heritage',
    aboutHistoryText: 'Tao Xuan Pavilion was founded in an ancient monastery, inheriting the wisdom of ancient Taoism. Our founder is a renowned Taoist master, committed to spreading authentic Taoist culture to more people.',
    aboutValues: 'Core Values',
    aboutValuesText: 'We adhere to the philosophy of "The Tao follows nature, virtue governs the world", treating people with sincerity and serving with virtue, providing the best service and most authentic artifacts to every customer.',
    
    // Contact us page
    contactTitle: 'Contact Us',
    contactInfo: 'Contact Information',
    contactEmail: 'Email: support@taoxuan.com',
    contactPhone: 'Phone: +86 400-888-0000',
    contactHours: 'Business Hours: 9:00 AM - 6:00 PM (UTC+8)',
    contactAddress: 'Address: Taoxuan Building 888, Chaoyang District, Beijing, China',
    
    // Button text
    viewDetails: 'View Details',
    buyNow: 'Buy Now',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    edit: 'Edit',
    delete: 'Delete',
    search: 'Search',
    
    // Message prompts
    loginSuccess: 'Login successful!',
    logoutSuccess: 'Logout successful!',
    registerSuccess: 'Registration successful! Welcome to Tao Xuan Pavilion!',
    registerAndLoginSuccess: 'Registration successful! You have been automatically logged in. Welcome to Tao Xuan Pavilion!',
    loginFailed: 'Login failed',
    registerFailed: 'Registration failed',
    profileUpdated: 'Profile updated successfully!',
    itemAddedToCart: 'Artifact added to cart successfully!',
    itemRemovedFromCart: 'Artifact removed from cart.',
    cartCleared: 'Cart cleared successfully.',
    orderPlaced: 'Order placed successfully!',
    orderCreated: 'Order created successfully!',
    addItemFailed: 'Failed to add item to cart',
    removeItemFailed: 'Failed to remove item',
    updateQuantityFailed: 'Failed to update quantity',
    clearCartFailed: 'Failed to clear cart',
    
    // Error messages
    networkError: 'Network connection failed. Please check your internet connection.',
    serverError: 'Server error occurred. Please try again later.',
    unauthorized: 'Please login to continue.',
    forbidden: 'You do not have permission to perform this action.',
    notFound: 'The requested resource was not found.',
    validationError: 'Please check your input and try again.',
    cartFull: 'Your cart is full. Maximum items allowed: ' + (window.APP_CONFIG ? window.APP_CONFIG.MAX_CART_ITEMS : 99),
    productNotAvailable: 'This artifact is currently not available.',
    loginRequired: 'Please login to add artifacts to cart.',
    
    // Specific API error message translations
    'Email already exists': 'This email address is already registered. Please use a different email or try logging in.',
    'Invalid email or password': 'Invalid email or password. Please check and try again.',
    'Invalid data': 'Invalid input data. Please check your email and password format.',
    'User not found': 'User not found',
    'Invalid password': 'Invalid password',
    'Email is required': 'Email address is required',
    'Password is required': 'Password is required',
    'Invalid email format': 'Invalid email format',
    'Password too short': 'Password is too short, must be at least 8 characters. Please use a more secure password.',
    'Internal server error': 'Internal server error. Please try again later.',
    'Bad request': 'Bad request parameters',
    'Service unavailable': 'Service temporarily unavailable. Please try again later.',
    'Network error': 'Network connection error. Please check your internet connection.',
    
    // Validation errors
    emailRequired: 'Please enter your email address',
    emailInvalid: 'Please enter a valid email address',
    passwordRequired: 'Please enter your password',
    passwordTooShort: 'Password must be at least 6 characters',
    passwordMismatch: 'Passwords do not match',
    
    // Footer
    footerCopyright: '© 2024 Tao Xuan Pavilion. All rights reserved.',
    footerPrivacy: 'Privacy Policy',
    footerTerms: 'Terms of Service',
    footerReturns: 'Return Policy',
    
    // Loading states
    loading: 'Loading...',
    loadingProducts: 'Loading artifacts...',
    processing: 'Processing...',
    
    // Pagination
    previous: 'Previous',
    next: 'Next',
    page: 'Page',
    pageOf: 'of',
    pages: 'pages',
    
    // Filter and sort
    sortBy: 'Sort by',
    sortDefault: 'Default',
    sortPriceAsc: 'Price: Low to High',
    sortPriceDesc: 'Price: High to Low',
    sortNameAsc: 'Name: A-Z',
    sortNameDesc: 'Name: Z-A',
    allCategories: 'All Categories',
    search: 'Search artifacts...',
    currencySymbol: '$',
    
    // Shopping cart related translation keys
    cartTitle: 'Shopping Cart',
    cartEmpty: 'Your cart is empty',
    clearCart: 'Clear Cart',
    confirmClearCart: 'Are you sure you want to clear the cart?',
    checkoutFailed: 'Checkout failed',
    totalPrice: 'Total Price',
    
    // Form related translation keys
    noAccount: "Don't have an account?",
    haveAccount: 'Already have an account?',
    
    // Product details
    productImages: 'Artifact Images',
    productFeatures: 'Features',
    productSpecs: 'Specifications',
    relatedProducts: 'Related Artifacts',
    
    // User profile
    personalInfo: 'Personal Information',
    orderHistory: 'Order History',
    favorites: 'Favorites',
    settings: 'Settings',
    username: 'Username',
    firstName: 'First Name',
    lastName: 'Last Name',
    phone: 'Phone',
    address: 'Address',
    saveChanges: 'Save Changes',
    language: 'Language',
    notifications: 'Notifications',
    privacy: 'Privacy',
    emailNotifications: 'Email notifications',
    publicProfile: 'Make profile public',
    dangerZone: 'Danger Zone',
    deleteAccount: 'Delete Account',
    confirmDeleteAccount: 'Are you sure you want to delete your account? This action cannot be undone.',
    loadingOrders: 'Loading orders...',
    loadingFavorites: 'Loading favorites...',
    noOrders: 'No orders found.',
    noFavorites: 'No favorites found.',
    failedToLoadOrders: 'Failed to load orders.',
    failedToLoadFavorites: 'Failed to load favorites.',
    
    // Video player modes
    videoModeContain: 'Fit',
    videoModeCover: 'Fill',
    videoModeFill: 'Stretch',
    videoModeTitle: 'Video Display Mode',
    videoModeContainDesc: 'Show complete video with possible letterboxing',
    videoModeCoverDesc: 'Fill container, may crop content',
    videoModeFillDesc: 'Stretch to fill, may distort',
    loginRequired: 'Login Required',
    loginRequiredDesc: 'Please login to access your profile.',
    
    // Product cards and carousel
    carousel: 'Carousel',
    videoLoading: 'Loading...',
    
    // Contact form
    contactForm: 'Contact Form',
    contactName: 'Name',
    contactEmailField: 'Email',
    contactMessage: 'Message',
    contactSend: 'Send Message',
    messageSent: 'Message sent successfully! We will get back to you soon.'
};