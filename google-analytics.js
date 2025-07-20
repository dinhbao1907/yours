// Google Analytics 4 Tracking Code
// Replace GA_MEASUREMENT_ID with your actual Google Analytics 4 Measurement ID
// Example: G-XXXXXXXXXX

(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

// Initialize Google Analytics
// Replace 'GA_MEASUREMENT_ID' with your actual GA4 Measurement ID
ga('create', 'G-LZESZ95M6M', 'auto');
ga('send', 'pageview');

// Track custom events
function trackEvent(category, action, label) {
  if (typeof ga !== 'undefined') {
    ga('send', 'event', category, action, label);
  }
}

// Track page views
function trackPageView(page) {
  if (typeof ga !== 'undefined') {
    ga('send', 'pageview', page);
  }
}

// Track product views
function trackProductView(productName, productId, price) {
  if (typeof ga !== 'undefined') {
    ga('send', 'event', 'ecommerce', 'view_item', {
      'items': [{
        'item_id': productId,
        'item_name': productName,
        'price': price,
        'currency': 'VND'
      }]
    });
  }
}

// Track add to cart
function trackAddToCart(productName, productId, price, quantity) {
  if (typeof ga !== 'undefined') {
    ga('send', 'event', 'ecommerce', 'add_to_cart', {
      'items': [{
        'item_id': productId,
        'item_name': productName,
        'price': price,
        'quantity': quantity,
        'currency': 'VND'
      }]
    });
  }
}

// Track purchases
function trackPurchase(transactionId, total, items) {
  if (typeof ga !== 'undefined') {
    ga('send', 'event', 'ecommerce', 'purchase', {
      'transaction_id': transactionId,
      'value': total,
      'currency': 'VND',
      'items': items
    });
  }
} 