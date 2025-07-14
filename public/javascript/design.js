let currentColor = 'white';
let currentApparel = 'tshirt';

document.addEventListener('DOMContentLoaded', async () => {
  console.log("JavaScript file loaded successfully!");
  const designCanvas = document.querySelector('.design-canvas');
  const productImage = document.querySelector('.product-image');
  const colorOptions = document.querySelectorAll('.color');
  const fileInput = document.querySelector('.file-input');
  const mockupImages = document.querySelectorAll('.mockup-img');
  const patternImages = document.querySelectorAll('.pattern-img');
  const popupButtons = document.querySelectorAll('.popup-btn');
  const zoomButtons = document.querySelectorAll('.zoom-btn');
  const productNameInput = document.getElementById('productName');
  const productTypeInput = document.getElementById('productType');
  const productCodeInput = document.getElementById('productCode');
  const materialInput = document.getElementById('material');
  const priceInput = document.getElementById('priceInput');
  const descriptionInput = document.getElementById('descriptionInput');
  const designElementsContainer = document.querySelector('.design-elements-container');

  // Get draft design ID from URL if editing
  const urlParams = new URLSearchParams(window.location.search);
  const draftDesignId = urlParams.get('designId');

  // Hàm tạo UUID đơn giản
  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  if (!productImage) {
    console.error('Product image element not found! Check design.html for .product-image.');
    return;
  }

  let scale = 1;
  let activeElement = null;
  let currentMockup = 'resources/tshirt';

  // Generate random product code
  function generateProductCode() {
    return 'A' + Math.floor(10000 + Math.random() * 90000);
  }

  // Initialize product code
  productCodeInput.value = generateProductCode();

  // Make 'Thêm ảnh' button open file picker directly
  const addImageBtn = document.getElementById('addImageBtn');
  if (addImageBtn && fileInput) {
    addImageBtn.addEventListener('click', (e) => {
      e.preventDefault();
      fileInput.click();
    });
  }

  // In the generic popup-btn handler, skip the addImageBtn
  document.querySelectorAll('.popup-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      // Skip the save draft, submit, and add image buttons
      if (btn.id === 'saveDraftBtn' || btn.id === 'submitDesign' || btn.id === 'addImageBtn') {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      
      const option = btn.nextElementSibling;
      if (option) {
        // Check if this dropdown is already active
        const isActive = option.classList.contains('active');
        
        // Hide all other popups first
        document.querySelectorAll('.design-option .mockup-options, .design-option .color-options, .design-option .pattern-options').forEach(panel => {
          if (panel !== option) {
            panel.classList.remove('active');
            panel.style.display = 'none';
            // Remove active class from other buttons
            const otherBtn = panel.previousElementSibling;
            if (otherBtn && otherBtn.classList.contains('popup-btn')) {
              otherBtn.classList.remove('active');
            }
          }
        });
        
        // Toggle this dropdown
        if (isActive) {
          option.classList.remove('active');
          option.style.display = 'none';
          btn.classList.remove('active');
        } else {
          option.classList.add('active');
          option.style.display = 'flex';
          btn.classList.add('active');
        }
      }
    });
  });

  // Chọn loại áo
  document.querySelectorAll('.mockup-img').forEach(item => {
    item.addEventListener('click', () => {
      currentApparel = item.dataset.type;
      updateProductImage();
      // Keep dropdown open - don't close it
    });
  });

  // Chọn màu sắc
  colorOptions.forEach(color => {
    color.addEventListener('click', () => {
      currentColor = color.getAttribute('data-color');
      console.log('Color selected:', currentColor);
      updateProductImage();
      console.log('Image src updated to:', productImage.src);
      // Keep dropdown open - don't close it
    });
  });

  // Update product image based on apparel and color
  function updateProductImage() {
    const imageSrc = `resources/${currentApparel}-${currentColor}.png`;
    console.log('Attempting to load image from:', imageSrc);
    productImage.src = imageSrc;
    productImage.onload = () => {
      console.log('Image loaded successfully:', imageSrc);
      // No need to set width/height here, CSS will handle it
    };
    productImage.onerror = () => {
      console.error(`Failed to load image: ${imageSrc}. Check if file exists in resources folder.`);
      const fallbackSrc = 'resources/fallback-image.png';
      console.log('Attempting to load fallback image:', fallbackSrc);
      productImage.src = fallbackSrc;
      productImage.onload = () => {
        console.log('Fallback image loaded successfully:', fallbackSrc);
        // No need to set width/height here, CSS will handle it
      };
      productImage.onerror = () => {
        console.error(`Failed to load fallback image: ${fallbackSrc}. Using default placeholder.`);
        productImage.src = 'https://via.placeholder.com/100';
        // No need to set width/height here, CSS will handle it
      };
    };
  }

  // Function to compress image data URL
  function compressImageDataURL(dataURL, maxWidth = 800, quality = 0.8) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Calculate new dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Check if image has transparency by drawing it and checking for transparent pixels
        ctx.drawImage(img, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);
        const hasTransparency = checkForTransparency(imageData);
        
        // Clear canvas and redraw
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        
        // Use PNG for transparency, JPEG for opaque images
        const format = hasTransparency ? 'image/png' : 'image/jpeg';
        const compressedDataURL = canvas.toDataURL(format, hasTransparency ? undefined : quality);
        
        console.log('Image compressed:', {
          originalSize: dataURL.length,
          compressedSize: compressedDataURL.length,
          reduction: Math.round((1 - compressedDataURL.length / dataURL.length) * 100) + '%',
          hasTransparency: hasTransparency,
          format: format
        });
        
        resolve(compressedDataURL);
      };
      img.onerror = () => {
        console.warn('Failed to compress image, using original');
        resolve(dataURL);
      };
      img.src = dataURL;
    });
  }
  
  // Function to check if image has transparent pixels
  function checkForTransparency(imageData) {
    const data = imageData.data;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 255) { // Alpha channel less than 255 means transparency
        return true;
      }
    }
    return false;
  }

  // Helper to create a design element container with an image inside
  function createDesignElementContainer(imgElement, type) {
    const container = document.createElement('div');
    container.className = 'design-element-container';
    container.style.position = 'absolute';
    container.style.left = '250px'; // Default position
    container.style.top = '250px';  // Default position
    container.style.width = '100px'; // Default size
    container.style.height = '100px'; // Default size
    container.style.zIndex = '20';
    container.dataset.type = type;
    
    // Remove position/size from img and set it to fill container
    imgElement.style.position = 'static';
    imgElement.style.left = '';
    imgElement.style.top = '';
    imgElement.style.width = '100%';
    imgElement.style.height = '100%';
    imgElement.style.zIndex = '';
    
    // Add img to container
    container.appendChild(imgElement);
    return container;
  }

  // Thêm ảnh
  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('File selected:', file.name, 'Size:', file.size, 'Type:', file.type);
      const reader = new FileReader();
      reader.onload = async (event) => {
        console.log('File read successfully, data URL length:', event.target.result.length);
        // Compress the image before adding to canvas
        const compressedDataURL = await compressImageDataURL(event.target.result);
        const imgElement = document.createElement('img');
        imgElement.className = 'design-image';
        imgElement.dataset.type = 'image';
        imgElement.src = compressedDataURL;
        imgElement.onload = () => {
          // Create container (styles will be set by createDesignElementContainer)
          const container = createDesignElementContainer(imgElement, 'image');
          // Debug: log before adding to canvas
          console.log('Adding image container to canvas:', container, container.outerHTML);
          addElementToCanvas(container);
          makeDraggable(container);
        };
        imgElement.onerror = () => console.error('Lỗi tải ảnh từ file:', file.name);
      };
      reader.onerror = () => console.error('Lỗi khi đọc file ảnh:', file.name);
      reader.readAsDataURL(file);
    } else {
      console.warn('Không có file được chọn.');
    }
  });

  // Chọn họa tiết
  patternImages.forEach(img => {
    img.addEventListener('click', () => {
      const patternImg = document.createElement('img');
      patternImg.className = 'design-pattern';
      patternImg.dataset.type = 'pattern';
      patternImg.src = img.src;
      patternImg.onload = () => {
        // Create container (styles will be set by createDesignElementContainer)
        const container = createDesignElementContainer(patternImg, 'pattern');
        // Debug: log before adding to canvas
        console.log('Adding pattern container to canvas:', container, container.outerHTML);
        addElementToCanvas(container);
        makeDraggable(container);
      };
      patternImg.onerror = () => {
        console.error('Lỗi tải họa tiết:', img.src);
      };
      // Keep dropdown open - don't close it
    });
  });

  // Zoom controls
  zoomButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const action = btn.getAttribute('data-action');
      if (action === 'zoom-in' && scale < 2) {
        scale += 0.1;
      } else if (action === 'zoom-out' && scale > 0.5) {
        scale -= 0.1;
      } else if (action === 'reset') {
        scale = 1;
        resetCanvasPosition();
        // Remove any floating size panel
        document.querySelectorAll('body > div').forEach(div => {
          if (div.textContent && div.textContent.match(/\d+\s*[×x]\s*\d+px/)) {
            div.remove();
          }
        });
        // Remove all patterns and photos
        removeAllDesignElements();
        updateLayerPanel();
        return;
      }
      designCanvas.style.transform = `scale(${scale}) translate(${canvasOffsetX / scale}px, ${canvasOffsetY / scale}px)`;
      designCanvas.style.transformOrigin = 'center';
    });
  });

  // Canvas dragging functionality for zoom operations
  let isDraggingCanvas = false;
  let canvasStartX = 0;
  let canvasStartY = 0;
  let canvasOffsetX = 0;
  let canvasOffsetY = 0;

  designCanvas.addEventListener('mousedown', (e) => {
    // Only enable canvas dragging if we're not clicking on a design element or a resize handle
    if (
      !e.target.classList.contains('design-image') &&
      !e.target.classList.contains('design-pattern') &&
      !e.target.classList.contains('design-text') &&
      e.target !== productImage &&
      !e.target.closest('.resize-handle')
    ) {
      isDraggingCanvas = true;
      canvasStartX = e.clientX - canvasOffsetX;
      canvasStartY = e.clientY - canvasOffsetY;
      designCanvas.style.cursor = 'grabbing';
      e.preventDefault();
    }
  });

  document.addEventListener('mousemove', (e) => {
    if (isDraggingCanvas) {
      canvasOffsetX = e.clientX - canvasStartX;
      canvasOffsetY = e.clientY - canvasStartY;
      
      // Apply transform to move the canvas
      designCanvas.style.transform = `scale(${scale}) translate(${canvasOffsetX / scale}px, ${canvasOffsetY / scale}px)`;
      designCanvas.style.transformOrigin = 'center';
    }
  });

  document.addEventListener('mouseup', () => {
    if (isDraggingCanvas) {
      isDraggingCanvas = false;
      designCanvas.style.cursor = 'default';
    }
  });

  // Reset canvas position when zoom is reset
  function resetCanvasPosition() {
    canvasOffsetX = 0;
    canvasOffsetY = 0;
    designCanvas.style.transform = `scale(${scale})`;
    designCanvas.style.transformOrigin = 'center';
  }

  // Ensure all elements stay within the canvas
  function clampElementsToCanvas() {
    // Use offsetWidth/offsetHeight for canvas bounds
    designElementsArr.forEach(element => {
      let left = parseFloat(element.style.left) || 0;
      let top = parseFloat(element.style.top) || 0;
      let width = element.offsetWidth;
      let height = element.offsetHeight;
      left = Math.max(0, Math.min(left, designCanvas.offsetWidth / scale - width));
      top = Math.max(0, Math.min(top, designCanvas.offsetHeight / scale - height));
      element.style.left = `${left}px`;
      element.style.top = `${top}px`;
    });
  }

  // Function to adjust canvas content position
  function adjustCanvasContent() {
    const elements = designCanvas.querySelectorAll('.design-text, .design-image, .design-pattern');
    elements.forEach(element => {
      const rect = designCanvas.getBoundingClientRect();
      let newLeft = parseFloat(element.style.left) || 0;
      let newTop = parseFloat(element.style.top) || 0;
      newLeft = Math.max(0, Math.min(newLeft, rect.width / scale - element.offsetWidth));
      newTop = Math.max(0, Math.min(newTop, rect.height / scale - element.offsetHeight));
      element.style.left = `${newLeft}px`;
      element.style.top = `${newTop}px`;
    });
  }

  // Function to make elements draggable and resizable
  function makeDraggable(container) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    let isResizing = false;
    let startWidth = 0, startHeight = 0;
    let startX = 0, startY = 0;
    let startLeft = 0, startTop = 0;
    let resizeDir = '';
    let sizePanel = null;
    const handleDefs = [
      { cls: 'br', cursor: 'nwse-resize' },
      { cls: 'bl', cursor: 'nesw-resize' },
      { cls: 'tr', cursor: 'nesw-resize' },
      { cls: 'tl', cursor: 'nwse-resize' }
    ];
    let handles = [];

    // Remove old handles if any
    container.querySelectorAll('.resize-handle').forEach(h => h.remove());

    // Add 4 resize handles to the container
    handleDefs.forEach(def => {
      const handle = document.createElement('div');
      handle.className = 'resize-handle ' + def.cls;
      handle.style.cursor = def.cursor;
      container.appendChild(handle);
      handles.push(handle);
      handle.addEventListener('mousedown', function(e) {
        e.stopPropagation();
        e.preventDefault();
        isResizing = true;
        resizeDir = def.cls;
        startWidth = container.offsetWidth;
        startHeight = container.offsetHeight;
        startX = e.clientX;
        startY = e.clientY;
        startLeft = parseFloat(container.style.left) || 0;
        startTop = parseFloat(container.style.top) || 0;
        container.style.cursor = def.cursor;
        // Create size panel
        sizePanel = document.createElement('div');
        sizePanel.style.position = 'fixed';
        sizePanel.style.background = 'rgba(0, 0, 0, 0.8)';
        sizePanel.style.color = 'white';
        sizePanel.style.padding = '8px 12px';
        sizePanel.style.borderRadius = '6px';
        sizePanel.style.fontSize = '14px';
        sizePanel.style.fontFamily = 'Arial, sans-serif';
        sizePanel.style.zIndex = '1000';
        sizePanel.style.pointerEvents = 'none';
        sizePanel.style.fontWeight = 'bold';
        document.body.appendChild(sizePanel);
        document.addEventListener('mousemove', elementDrag);
        document.addEventListener('mouseup', closeDragElement);
      });
    });

    container.addEventListener('mousedown', dragMouseDown);

    function dragMouseDown(e) {
      e.preventDefault();
      e.stopPropagation();
      if (e.target.classList.contains('resize-handle')) return;
      isResizing = false;
      container.style.cursor = 'move';
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.addEventListener('mousemove', elementDrag);
      document.addEventListener('mouseup', closeDragElement);
    }

    function elementDrag(e) {
      e.preventDefault();
      if (isResizing) {
        let deltaX = e.clientX - startX;
        let deltaY = e.clientY - startY;
        let newWidth = startWidth, newHeight = startHeight;
        let newLeft = startLeft, newTop = startTop;
        if (resizeDir === 'br') {
          newWidth = Math.max(30, Math.min(400, startWidth + deltaX));
          newHeight = Math.max(30, Math.min(400, startHeight + deltaY));
        } else if (resizeDir === 'bl') {
          newWidth = Math.max(30, Math.min(400, startWidth - deltaX));
          newHeight = Math.max(30, Math.min(400, startHeight + deltaY));
          newLeft = startLeft + deltaX;
        } else if (resizeDir === 'tr') {
          newWidth = Math.max(30, Math.min(400, startWidth + deltaX));
          newHeight = Math.max(30, Math.min(400, startHeight - deltaY));
          newTop = startTop + deltaY;
        } else if (resizeDir === 'tl') {
          newWidth = Math.max(30, Math.min(400, startWidth - deltaX));
          newHeight = Math.max(30, Math.min(400, startHeight - deltaY));
          newLeft = startLeft + deltaX;
          newTop = startTop + deltaY;
        }
        container.style.width = `${newWidth}px`;
        container.style.height = `${newHeight}px`;
        container.style.left = `${newLeft}px`;
        container.style.top = `${newTop}px`;
        // Update size panel
        if (sizePanel) {
          sizePanel.textContent = `${Math.round(newWidth)} × ${Math.round(newHeight)}px`;
          sizePanel.style.left = `${e.clientX + 15}px`;
          sizePanel.style.top = `${e.clientY - 40}px`;
        }
      } else {
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        let newLeft = (parseFloat(container.style.left) || 0) - pos1 / scale;
        let newTop = (parseFloat(container.style.top) || 0) - pos2 / scale;
        let width = container.offsetWidth;
        let height = container.offsetHeight;
        const maxLeft = 600 - width;
        const maxTop = 600 - height;
        newLeft = Math.max(0, Math.min(newLeft, maxLeft));
        newTop = Math.max(0, Math.min(newTop, maxTop));
        container.style.left = `${newLeft}px`;
        container.style.top = `${newTop}px`;
      }
    }

    function closeDragElement() {
      document.removeEventListener('mousemove', elementDrag);
      document.removeEventListener('mouseup', closeDragElement);
      container.style.cursor = 'move';
      if (sizePanel) {
        sizePanel.remove();
        sizePanel = null;
      }
      isResizing = false;
    }
  }

  // Event listeners for form inputs
  productNameInput.addEventListener('input', () => {});
  productTypeInput.addEventListener('change', () => {});
  descriptionInput.addEventListener('input', () => {});

  // Price input: allow only digits while typing, show formatted number (with thousands separator, no ₫)
  priceInput.addEventListener('input', (e) => {
    priceInput.value = priceInput.value.replace(/[^\d]/g, '');
    if (priceInput.value) {
      priceInput.value = Number(priceInput.value).toLocaleString('vi-VN');
      priceInput.dataset.raw = priceInput.value.replace(/\./g, '');
    } else {
      priceInput.dataset.raw = '';
    }
  });
  // Format as VND on blur
  priceInput.addEventListener('blur', (e) => {
    if (priceInput.value) {
      priceInput.value = Number(priceInput.value.replace(/\./g, '')).toLocaleString('vi-VN') + ' ₫';
    } else {
      priceInput.value = '';
    }
  });
  // Remove formatting on focus for easy editing
  priceInput.addEventListener('focus', (e) => {
    priceInput.value = priceInput.dataset.raw || '';
  });

  productCodeInput.addEventListener('input', () => {});
  materialInput.addEventListener('input', () => {});

  // Initial update
  updateProductImage();

  // Close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.design-option')) {
      document.querySelectorAll('.design-option .mockup-options, .design-option .color-options, .design-option .pattern-options').forEach(panel => {
        panel.classList.remove('active');
        panel.style.display = 'none';
        // Remove active class from buttons
        const btn = panel.previousElementSibling;
        if (btn && btn.classList.contains('popup-btn')) {
          btn.classList.remove('active');
        }
      });
    }
  });

  const submitButton = document.getElementById('submitDesign');
  console.log('Submit button found:', submitButton); // Debug log

  if (submitButton) {
    submitButton.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const role = getRoleFromToken();
      console.log('[DEBUG] Role detected on submit:', role);
      if (role === 'customer') {
        // Customer: Đặt In Ngay triggers order flow with no required fields
        const productCode = productCodeInput ? productCodeInput.value : '';
        const material = materialInput ? materialInput.value : '';
        const price = 150000;
        const sizeEl = document.getElementById('sizeInput');
        const notesEl = document.getElementById('notesInput');
        const size = sizeEl ? sizeEl.value : '';
        const notes = notesEl ? notesEl.value : '';
        const designImage = await captureDesignImage();
        const orderItem = {
          name: 'Áo thiết kế riêng',
          productCode: productCode || '',
          material: material || '',
          price,
          size: size || '',
          notes: notes || '',
          designImage: designImage || '',
          type: 'custom-design',
          quantity: 1,
          timestamp: Date.now()
        };
        // Use the same cart key as checkout
        let cartKey = getCartKey();
        let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
        cart.push(orderItem);
        localStorage.setItem(cartKey, JSON.stringify(cart));
        window.location.href = 'cart.html';
        return;
      }
      console.log('🚀 Submit button clicked'); // Debug log
      console.log('🔍 unsavedChanges value:', unsavedChanges); // Debug log
      
      // Debug token
      const token = localStorage.getItem('token');
      console.log('🔑 Token found:', !!token); // Debug log
      console.log('🔑 Token value:', token ? token.substring(0, 20) + '...' : 'none'); // Debug log
      
      if (!token) {
        console.error('❌ No token found in localStorage');
        alert('Bạn cần đăng nhập để lưu thiết kế.');
        window.location.href = 'login.html';
        return;
      }

      // Debug token structure
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          console.log('🔍 Token payload:', payload);
          console.log('🔍 Token expires:', new Date(payload.exp * 1000));
          console.log('🔍 Token is expired:', Date.now() > payload.exp * 1000);
        }
      } catch (e) {
        console.error('❌ Invalid token structure:', e);
      }

      // Use draftDesignId if editing, otherwise generate a new one
      const designId = draftDesignId || generateUUID();
      const productType = productTypeInput.value;
      const material = materialInput.value;
      const color = currentColor;
      const price = parseFloat(priceInput.dataset.raw || '0');
      const productCode = productCodeInput.value;
      const description = descriptionInput.value;

      console.log('📝 Form values:', { productType, material, color, price, productCode, description }); // Debug log

      // Thu thập designElements
      const designElements = Array.from(designCanvas.querySelectorAll('.design-element-container'))
        .map(container => {
          const imgElement = container.querySelector('img');
          if (!imgElement) return null;
          
          const type = imgElement.dataset.type;
          let content = '';
          if (type === 'pattern') {
            const src = imgElement.src || '';
            const parts = src.split('/');
            const filename = parts[parts.length - 1] || '';
            if (/^pattern\d+\.(png|svg)$/i.test(filename)) {
              content = 'resources/' + filename;
            } else if (src) {
              content = src;
            } else {
              content = 'resources/pattern1.png';
            }
          } else if (type === 'image') {
            content = imgElement.src || 'resources/placeholder.png';
          } else if (type === 'text') {
            content = imgElement.textContent || '';
          }
          
          const rect = container.getBoundingClientRect();
          const canvasRect = designCanvas.getBoundingClientRect();
          const elementData = {
            type,
            content,
            x: (rect.left - canvasRect.left) / scale,
            y: (rect.top - canvasRect.top) / scale,
            width: rect.width / scale,
            height: rect.height / scale,
            color: imgElement.style.color || '#000000'
          };
          console.log(`Saving ${type} element:`, elementData);
          return elementData;
        })
        .filter(element => element !== null); // Remove null elements
      
      console.log('📦 Design elements array to be saved:', designElements);
      // Filter out invalid elements
      const validDesignElements = designElements.filter(el => el.content && el.content.trim() !== '');
      console.log('✅ Filtered valid design elements:', validDesignElements);
      
      // Debug: Show content details for each element
      validDesignElements.forEach((el, index) => {
        console.log(`📋 Element ${index} (${el.type}):`, {
          contentLength: el.content ? el.content.length : 0,
          contentPreview: el.content ? el.content.substring(0, 100) + '...' : 'no content',
          isDataURL: el.content ? el.content.startsWith('data:image/') : false
        });
      });

      // Capture the design image
      const designImage = await captureDesignImage();
      console.log('🖼️ Design image captured, length:', designImage ? designImage.length : 'none');

      // Use validDesignElements in the request body
      const designData = {
        designId,
        name: productNameInput.value,
        productType,
        material,
        color,
        price,
        productCode,
        description,
        designElements: validDesignElements,
        designImage,
        status: 'pending' // Always set to pending when submitting for review
      };

      // --- CHANGED LOGIC STARTS HERE ---
      const isEditingDraft = !!draftDesignId;
      const endpoint = isEditingDraft ? '/api/update-draft' : '/api/submit-design';
      const method = isEditingDraft ? 'PUT' : 'POST';

      try {
        console.log(`Making request to: https://yours-fashion.vercel.app${endpoint} [${method}]`);
        console.log('🔑 Authorization header:', `Bearer ${token.substring(0, 20)}...`);
        
        const response = await fetch(`https://yours-fashion.vercel.app${endpoint}`, {
          method: method,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(designData)
        });

        console.log('📥 Response status:', response.status);
        console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));
        
        const result = await response.json();
        console.log('📥 Server response:', result); // Debug log
        
        if (response.ok) {
          console.log('✅ Design submitted successfully');
          unsavedChanges = false; // Clear unsaved changes after successful submission
          // Use original location.href to bypass navigation interception
          if (originalHref && originalHref.set) {
            originalHref.set.call(window.location, 'checking.html');
          } else {
            window.location.href = 'checking.html';
          }
        } else {
          console.error('❌ Server error:', result);
          alert(result.message || 'Lỗi khi gửi thiết kế');
        }
      } catch (error) {
        console.error('❌ Network error:', error);
        alert('Lỗi kết nối server: ' + error.message);
      }
    });
  } else {
    console.error('❌ Nút Đăng bài không được tìm thấy');
  }

  // Đảm bảo currentColor và generateProductCode được định nghĩa
  window.currentColor = window.currentColor || 'white';
  if (typeof generateProductCode !== 'function') {
    window.generateProductCode = function() {
      return 'A' + Math.floor(10000 + Math.random() * 90000);
    };
  }

  // --- LAYER PANEL LOGIC ---
  let designElementsArr = [];
  let selectedElement = null;

  function updateLayerPanel() {
    const layerList = document.getElementById('layerList');
    if (!layerList) return;
    layerList.innerHTML = '';
    
    // Display layers in reverse order so front layers appear at top of list
    const reversedElements = [...designElementsArr].reverse();
    
    reversedElements.forEach((el, displayIdx) => {
      // Calculate the actual index in the original array
      const actualIdx = designElementsArr.length - 1 - displayIdx;
      // Visual layer number (1 = front, 2 = second, etc.)
      const visualLayerNumber = displayIdx + 1;
      
      const li = document.createElement('li');
      li.className = 'layer-item' + (el === selectedElement ? ' selected' : '');
      li.textContent = `${visualLayerNumber}. ` + (
        el.dataset.type === 'text' ? 'Text: ' + (el.textContent || '') :
        el.dataset.type === 'image' ? 'Image' :
        el.dataset.type === 'pattern' ? 'Pattern' : 'Layer'
      );
      // Controls
      const controls = document.createElement('div');
      controls.className = 'layer-controls';
      // Up (move to front)
      const upBtn = document.createElement('button');
      upBtn.className = 'layer-btn';
      upBtn.innerHTML = '↑';
      upBtn.onclick = (e) => { e.stopPropagation(); moveLayer(actualIdx, 1); };
      controls.appendChild(upBtn);
      // Down (move to back)
      const downBtn = document.createElement('button');
      downBtn.className = 'layer-btn';
      downBtn.innerHTML = '↓';
      downBtn.onclick = (e) => { e.stopPropagation(); moveLayer(actualIdx, -1); };
      controls.appendChild(downBtn);
      // Delete
      const delBtn = document.createElement('button');
      delBtn.className = 'layer-btn';
      delBtn.innerHTML = '✖';
      delBtn.onclick = (e) => { e.stopPropagation(); removeLayer(actualIdx); };
      controls.appendChild(delBtn);
      li.appendChild(controls);
      li.onclick = () => selectLayer(actualIdx);
      layerList.appendChild(li);
    });
  }

  function moveLayer(idx, dir) {
    if ((dir === -1 && idx === 0) || (dir === 1 && idx === designElementsArr.length - 1)) return;
    const el = designElementsArr[idx];
    designElementsArr.splice(idx, 1);
    designElementsArr.splice(idx + dir, 0, el);
    // Update z-index/order in DOM
    designElementsArr.forEach(e => designCanvas.appendChild(e));
    updateLayerPanel();
  }

  function removeLayer(idx) {
    const el = designElementsArr[idx];
    el.remove();
    designElementsArr.splice(idx, 1);
    updateLayerPanel();
  }

  function selectLayer(idx) {
    selectedElement = designElementsArr[idx];
    console.log('🎯 Selecting layer:', idx, selectedElement ? selectedElement.className : 'none');
    
    designElementsArr.forEach(e => {
      e.style.outline = '';
      e.classList.remove('selected');
      // Hide resize handles for non-selected elements
      e.querySelectorAll('.resize-handle').forEach(h => h.style.display = 'none');
    });
    
    if (selectedElement) {
      selectedElement.style.outline = '2px solid #7c3aed';
      selectedElement.classList.add('selected');
      // Show resize handles for selected element
      selectedElement.querySelectorAll('.resize-handle').forEach(h => h.style.display = 'flex');
    }
    updateLayerPanel();
  }

  // --- Hook into element creation ---
  function addElementToCanvas(container, updateLayers = true) {
    console.log('➕ Adding element to canvas:', container.className, container.dataset.type);
    
    // Remove any previous click handler
    container.onclick = null;
    designCanvas.appendChild(container);
    designElementsArr.push(container);
    if (updateLayers) {
      updateLayerPanel();
    }
    container.onclick = (e) => {
      e.stopPropagation();
      console.log('🖱️ Element clicked:', container.className, container.dataset.type);
      
      selectedElement = container;
      designElementsArr.forEach(e => {
        e.style.outline = '';
        e.classList.remove('selected');
        // Hide resize handles for non-selected elements
        e.querySelectorAll('.resize-handle').forEach(h => h.style.display = 'none');
      });
      
      container.style.outline = '2px solid #7c3aed';
      container.classList.add('selected');
      // Show resize handles for selected element
      container.querySelectorAll('.resize-handle').forEach(h => h.style.display = 'flex');
      
      updateLayerPanel();
    };
  }

  // When clicking outside, deselect
  designCanvas.addEventListener('click', (e) => {
    if (e.target === designCanvas) {
      console.log('🖱️ Clicked outside elements, deselecting');
      selectedElement = null;
      designElementsArr.forEach(e => {
        e.style.outline = '';
        e.classList.remove('selected');
        // Hide resize handles for all elements
        e.querySelectorAll('.resize-handle').forEach(h => h.style.display = 'none');
      });
      updateLayerPanel();
    }
  });

  let unsavedChanges = false;

  // Mark unsaved changes on any edit
  function markUnsaved() { unsavedChanges = true; }

  // Listen to all relevant events
  [productNameInput, productTypeInput, materialInput, priceInput, descriptionInput].forEach(input => {
    if (input) input.addEventListener('input', markUnsaved);
  });
  designCanvas.addEventListener('input', markUnsaved);
  designCanvas.addEventListener('click', markUnsaved, true);
  designCanvas.addEventListener('mousedown', markUnsaved, true);
  designCanvas.addEventListener('mouseup', markUnsaved, true);
  // Also mark on adding/removing elements
  function markUnsavedOnElementChange() { unsavedChanges = true; }
  // Patch addElementToCanvas and removeLayer
  const origAddElementToCanvas = addElementToCanvas;
  addElementToCanvas = function(...args) { markUnsavedOnElementChange(); return origAddElementToCanvas.apply(this, args); };
  const origRemoveLayer = removeLayer;
  removeLayer = function(...args) { markUnsavedOnElementChange(); return origRemoveLayer.apply(this, args); };

  // Intercept all navigation
  function interceptNav(selector) {
    document.querySelectorAll(selector).forEach(btn => {
      btn.addEventListener('click', function(e) {
        if (unsavedChanges) {
          e.preventDefault();
          e.stopPropagation();
          
          // Get the target URL
          let targetUrl = btn.href || btn.getAttribute('data-href');
          if (!targetUrl && btn.getAttribute('onclick')) {
            const onclickMatch = btn.getAttribute('onclick').match(/window\.location\.(?:replace|assign|href\s*=\s*)\(['"]([^'"]+)['"]\)/);
            if (onclickMatch) {
              targetUrl = onclickMatch[1];
            }
          }
          
          if (targetUrl) {
            showUnsavedModal(() => {
              // Save draft, then navigate
              saveDraft();
              setTimeout(() => {
                unsavedChanges = false;
                window.location.href = targetUrl;
              }, 1000);
            }, () => {
              // Continue without saving
              unsavedChanges = false;
              window.location.href = targetUrl;
            });
          }
        }
      });
    });
  }

  // Intercept all nav buttons/links
  interceptNav('a, button.user-btn');

  // Also intercept any dynamically added navigation elements
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === 1) { // Element node
            if (node.matches && (node.matches('a') || node.matches('button.user-btn'))) {
              interceptNav('a, button.user-btn');
            }
            if (node.querySelectorAll) {
              const navElements = node.querySelectorAll('a, button.user-btn');
              if (navElements.length > 0) {
                interceptNav('a, button.user-btn');
              }
            }
          }
        });
      }
    });
  });

  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Handle direct URL changes (address bar, bookmarks, etc.)
  let currentUrl = window.location.href;
  setInterval(() => {
    if (window.location.href !== currentUrl && unsavedChanges) {
      // URL changed directly, show modal
      const newUrl = window.location.href;
      // Revert the URL change
      history.replaceState(null, null, currentUrl);
      
      showUnsavedModal(() => {
        // Save draft, then navigate
        saveDraft();
        setTimeout(() => {
          unsavedChanges = false;
          window.location.href = newUrl;
        }, 1000);
      }, () => {
        // Continue without saving
        unsavedChanges = false;
        window.location.href = newUrl;
      });
    }
    currentUrl = window.location.href;
  }, 100);

  // Handle browser back/forward buttons
  window.addEventListener('popstate', function(e) {
    if (unsavedChanges) {
      e.preventDefault();
      // Push the current state back to prevent navigation
      history.pushState(null, null, window.location.href);
      
      showUnsavedModal(() => {
        // Save draft, then allow navigation
        saveDraft();
        setTimeout(() => {
          unsavedChanges = false;
          // Trigger the back/forward again
          history.back();
        }, 1000);
      }, () => {
        // Continue without saving
        unsavedChanges = false;
        // Trigger the back/forward again
        history.back();
      });
    }
  });

  // Initialize history state to handle back/forward properly
  history.replaceState(null, null, window.location.href);

  // Handle page refresh (F5, Ctrl+R, etc.)
  window.addEventListener('keydown', function(e) {
    if (unsavedChanges && (e.key === 'F5' || (e.ctrlKey && e.key === 'r'))) {
      e.preventDefault();
      showUnsavedModal(() => {
        // Save draft, then refresh
        saveDraft();
        setTimeout(() => {
          unsavedChanges = false;
          window.location.reload();
        }, 1000);
      }, () => {
        // Continue without saving
        unsavedChanges = false;
        window.location.reload();
      });
    }
  });

  // Prevent native beforeunload popup and handle navigation through custom logic
  window.addEventListener('beforeunload', function(e) {
    if (unsavedChanges) {
      e.preventDefault();
      e.returnValue = ''; // This is required for older browsers
      
      // For browser tab/window closing, we can only show the native popup
      // But we can prevent it and show our custom modal if the user cancels
      const message = 'Bạn có thay đổi chưa lưu. Bạn có chắc chắn muốn rời khỏi trang này?';
      e.returnValue = message;
      return message;
    }
  });

  // Also handle visibility change (when user switches tabs)
  document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'hidden' && unsavedChanges) {
      // User is leaving the tab, we can't prevent it but we can show a notification
      console.log('User left tab with unsaved changes');
    }
  });

  // Store the intended navigation URL
  let pendingNavigation = null;

  // Override window.location methods to intercept navigation
  const originalLocation = window.location;
  const originalReplace = window.location.replace;
  const originalAssign = window.location.assign;
  const originalHref = Object.getOwnPropertyDescriptor(window.location, 'href');

  // Check if navigation interception is already set up
  if (!window._navigationInterceptionSetup) {
    window._navigationInterceptionSetup = true;

    // Override location.replace
    window.location.replace = function(url) {
      if (unsavedChanges) {
        pendingNavigation = url;
        showUnsavedModal(() => {
          // Save draft, then navigate
          saveDraft();
          setTimeout(() => {
            unsavedChanges = false;
            originalReplace.call(window.location, url);
          }, 1000);
        }, () => {
          // Continue without saving
          unsavedChanges = false;
          originalReplace.call(window.location, url);
        });
      } else {
        originalReplace.call(window.location, url);
      }
    };

    // Override location.assign
    window.location.assign = function(url) {
      if (unsavedChanges) {
        pendingNavigation = url;
        showUnsavedModal(() => {
          // Save draft, then navigate
          saveDraft();
          setTimeout(() => {
            unsavedChanges = false;
            originalAssign.call(window.location, url);
          }, 1000);
        }, () => {
          // Continue without saving
          unsavedChanges = false;
          originalAssign.call(window.location, url);
        });
      } else {
        originalAssign.call(window.location, url);
      }
    };

    // Override location.href setter only if it hasn't been redefined
    try {
      Object.defineProperty(window.location, 'href', {
        set: function(url) {
          if (unsavedChanges) {
            pendingNavigation = url;
            showUnsavedModal(() => {
              // Save draft, then navigate
              saveDraft();
              setTimeout(() => {
                unsavedChanges = false;
                originalHref.set.call(window.location, url);
              }, 1000);
            }, () => {
              // Continue without saving
              unsavedChanges = false;
              originalHref.set.call(window.location, url);
            });
          } else {
            originalHref.set.call(window.location, url);
          }
        },
        get: originalHref.get
      });
    } catch (e) {
      console.warn('Location href property already redefined, skipping:', e);
    }
  }

  // Handle direct URL navigation (address bar, bookmarks, etc.)
  let isNavigating = false;
  function safeNavigate(url) {
    if (unsavedChanges && !isNavigating) {
      isNavigating = true;
      showUnsavedModal(() => {
        // Save draft, then navigate
        saveDraft();
        setTimeout(() => {
          unsavedChanges = false;
          isNavigating = false;
          window.location.href = url;
        }, 1000);
      }, () => {
        // Continue without saving
        unsavedChanges = false;
        isNavigating = false;
        window.location.href = url;
      });
    } else if (!isNavigating) {
      window.location.href = url;
    }
  }

  // Show custom unsaved modal
  function showUnsavedModal(onSave, onContinue) {
    const role = getRoleFromToken && getRoleFromToken();
    if (role === 'customer') {
      // For customers, just show the modal and allow saving regardless of fields
      const modal = document.getElementById('unsavedModal');
      if (!modal) return;
      modal.style.display = 'block';
      document.getElementById('unsavedSaveBtn').onclick = async function() {
        await saveDraftButton.click();
        modal.style.display = 'none';
        if (onSave) onSave();
      };
      document.getElementById('unsavedContinueBtn').onclick = function() {
        modal.style.display = 'none';
        if (onContinue) onContinue();
      };
      return;
    }
    const modal = document.getElementById('unsavedModal');
    const saveBtn = document.getElementById('unsavedSaveBtn');
    const contBtn = document.getElementById('unsavedContinueBtn');
    
    // Show modal
    modal.style.display = 'block';
    
    function cleanup() {
      modal.style.display = 'none';
      saveBtn.removeEventListener('click', saveHandler);
      contBtn.removeEventListener('click', contHandler);
      modal.removeEventListener('click', modalClickHandler);
      document.removeEventListener('keydown', escapeHandler);
    }
    
    function saveHandler() {
      cleanup();
      if (onSave) onSave();
    }
    
    function contHandler() {
      cleanup();
      if (onContinue) onContinue();
    }
    
    function modalClickHandler(e) {
      if (e.target === modal) {
        // Click outside modal - treat as continue without saving
        contHandler();
      }
    }
    
    function escapeHandler(e) {
      if (e.key === 'Escape') {
        // Escape key - treat as continue without saving
        contHandler();
      }
    }
    
    // Add event listeners
    saveBtn.addEventListener('click', saveHandler);
    contBtn.addEventListener('click', contHandler);
    modal.addEventListener('click', modalClickHandler);
    document.addEventListener('keydown', escapeHandler);
  }

  // --- Save Draft Function ---
  async function saveDraft() {
    console.log('saveDraft function called!'); // Debug log
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Bạn cần đăng nhập để lưu nháp thiết kế.');
      // Use original location.href to bypass navigation interception
      if (originalHref && originalHref.set) {
        originalHref.set.call(window.location, 'login.html');
      } else {
        window.location.href = 'login.html';
      }
      return;
    }
    console.log('Token found, proceeding with draft save...'); // Debug log
    
    // Check if all required elements exist
    if (!productCodeInput) {
      console.error('productCodeInput not found');
      alert('Lỗi: Không tìm thấy mã sản phẩm');
      return;
    }
    if (!productNameInput) {
      console.error('productNameInput not found');
      alert('Lỗi: Không tìm thấy tên sản phẩm');
      return;
    }
    if (!productTypeInput) {
      console.error('productTypeInput not found');
      alert('Lỗi: Không tìm thấy loại sản phẩm');
      return;
    }
    if (!priceInput) {
      console.error('priceInput not found');
      alert('Lỗi: Không tìm thấy giá sản phẩm');
      return;
    }
    if (!descriptionInput) {
      console.error('descriptionInput not found');
      alert('Lỗi: Không tìm thấy mô tả sản phẩm');
      return;
    }
    
    // Use productCode as designId for new designs
    const designId = draftDesignId || productCodeInput.value;
    const productType = productTypeInput.value;
    const material = document.getElementById('material') ? document.getElementById('material').value : 'Vải Cotton';
    const color = currentColor;
    const price = parseFloat(priceInput.dataset.raw || '0');
    const productCode = productCodeInput.value;
    const description = descriptionInput.value;
    // Thu thập designElements
    const designElements = Array.from(designCanvas.querySelectorAll('.design-element-container'))
      .map(container => {
        const imgElement = container.querySelector('img');
        if (!imgElement) return null;
        
        const type = imgElement.dataset.type;
        let content = '';
        if (type === 'pattern') {
          const src = imgElement.src || '';
          const parts = src.split('/');
          const filename = parts[parts.length - 1] || '';
          if (/^pattern\d+\.(png|svg)$/i.test(filename)) {
            content = 'resources/' + filename;
          } else if (src) {
            content = src;
          } else {
            content = 'resources/pattern1.png';
          }
        } else if (type === 'image') {
          content = imgElement.src || 'resources/placeholder.png';
        } else if (type === 'text') {
          content = imgElement.textContent || '';
        }
        
        const rect = container.getBoundingClientRect();
        const canvasRect = designCanvas.getBoundingClientRect();
        const elementData = {
          type,
          content,
          x: (rect.left - canvasRect.left) / scale,
          y: (rect.top - canvasRect.top) / scale,
          width: rect.width / scale,
          height: rect.height / scale,
          color: imgElement.style.color || '#000000'
        };
        console.log(`Saving ${type} element:`, elementData);
        return elementData;
      })
      .filter(element => element !== null); // Remove null elements
    // Filter out invalid elements
    const validDesignElements = designElements.filter(el => el.content && el.content.trim() !== '');
    console.log('Filtered valid design elements:', validDesignElements);

    // Capture the design image
    let designImage = await captureDesignImage();
    if (!designImage || !designImage.startsWith('data:image/') || designImage.length < 100) {
      console.warn('captureDesignImage failed or returned invalid image, using fallback.');
      designImage = 'resources/tshirt-white.png';
    }
    const designData = {
      designId,
      name: productNameInput.value,
      productType,
      material,
      color,
      price,
      productCode,
      description,
      designElements: validDesignElements,
      designImage,
      status: 'draft'
    };
    
    console.log('Design data to save:', designData);
    try {
      // Determine if we're editing an existing draft or creating a new one
      const isEditingDraft = !!draftDesignId;
      const endpoint = isEditingDraft ? '/api/update-draft' : '/api/submit-design';
      const method = isEditingDraft ? 'PUT' : 'POST';
      
      console.log(`Saving draft using ${method} ${endpoint}, isEditingDraft: ${isEditingDraft}`);
      
              const response = await fetch(`https://yours-fashion.vercel.app${endpoint}`, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(designData)
      });
      const result = await response.json();
      console.log('Draft save response:', result);
      if (response.ok) {
        // Show success modal
        document.getElementById('successModal').style.display = 'block';
        unsavedChanges = false;
        return true; // Success
      } else {
        alert(result.message || 'Lỗi khi lưu nháp thiết kế');
        return false; // Failed
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Lỗi kết nối server: ' + error.message);
      return false; // Failed
    }
  }

  // --- LOAD DRAFT LOGIC ---
  if (draftDesignId) {
    const token = localStorage.getItem('token');
    fetch('https://yours-fashion.vercel.app/api/my-designs', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(designs => {
        const draft = (designs || []).find(d => d.designId === draftDesignId);
        if (draft) {
          console.log('Loading draft:', draft);
          console.log('Design elements to restore:', draft.designElements);
          // Populate form fields
          if (productNameInput) productNameInput.value = draft.name || '';
          if (productTypeInput) productTypeInput.value = draft.productType || 'Áo T-shirt';
          if (productCodeInput) {
            productCodeInput.value = draft.productCode || generateProductCode();
            productCodeInput.readOnly = true;
          }
          if (materialInput) materialInput.value = draft.material || 'Vải Cotton';
          if (priceInput) {
            const price = draft.price || 0;
            priceInput.value = price.toLocaleString('vi-VN');
            priceInput.dataset.raw = price.toString();
          }
          if (descriptionInput) descriptionInput.value = draft.description || '';
          // Set color and update product image
          if (draft.color) {
            currentColor = draft.color;
          }
          if (draft.apparel) {
            currentApparel = draft.apparel;
          }
          updateProductImage();
          // Clear only design elements, not the product image
          const existingDesignElements = designCanvas.querySelectorAll('.design-text, .design-image, .design-pattern');
          existingDesignElements.forEach(el => el.remove());
          // Clear the design elements array
          designElementsArr = [];
          // Add design elements
          let elementsToLoad = (draft.designElements || []).length;
          if (elementsToLoad === 0) updateLayerPanel();
          (draft.designElements || []).forEach((el, index) => {
            console.log(`Restoring element ${index}:`, el);
            if (el.type === 'image' || el.type === 'pattern') {
              const img = document.createElement('img');
              img.className = el.type === 'image' ? 'design-image' : 'design-pattern';
              img.dataset.type = el.type;
              img.src = el.content;
              img.style.width = '100%';
              img.style.height = '100%';
              // Create container and set position/size
              const container = createDesignElementContainer(img, el.type);
              container.style.left = (el.x || 0) + 'px';
              container.style.top = (el.y || 0) + 'px';
              container.style.width = (el.width || 100) + 'px';
              container.style.height = (el.height || 100) + 'px';
              container.style.zIndex = '20';
              addElementToCanvas(container);
              makeDraggable(container);
            }
          });
        } else {
          console.error('Draft not found:', draftDesignId);
        }
      })
      .catch(error => {
        console.error('Error loading draft:', error);
      });
  }

  // Ensure product image is always centered and fixed in the canvas
  if (productImage) {
    productImage.style.pointerEvents = 'none'; // Prevent drag/select
    productImage.style.userSelect = 'none';
    productImage.draggable = false;
    // Always keep centered and full size
    productImage.style.position = 'absolute';
    productImage.style.top = '50%';
    productImage.style.left = '50%';
    productImage.style.transform = 'translate(-50%, -50%)';
    productImage.style.width = '100%';
    productImage.style.height = '100%';
    productImage.style.maxWidth = '100%';
    productImage.style.maxHeight = '100%';
    productImage.style.zIndex = '10';
  }

  // Initialize size input panel functionality
  function initializeSizePanel() {
    const widthInput = document.getElementById('widthInput');
    const heightInput = document.getElementById('heightInput');
    const applySizeBtn = document.getElementById('applySizeBtn');
    const sizeInputPanel = document.getElementById('sizeInputPanel');
    
    // Update inputs when element is selected
    function updateSizeInputs(element) {
      if (element && (element.classList.contains('design-image') || element.classList.contains('design-pattern'))) {
        widthInput.value = Math.round(element.offsetWidth);
        heightInput.value = Math.round(element.offsetHeight);
        sizeInputPanel.style.display = '';
      } else {
        widthInput.value = '';
        heightInput.value = '';
        sizeInputPanel.style.display = 'none';
      }
    }
    
    // Apply size button click
    applySizeBtn.addEventListener('click', () => {
      const selectedElement = document.querySelector('.design-image.selected, .design-pattern.selected');
      if (!selectedElement) {
        alert('Vui lòng chọn một hình ảnh hoặc mẫu để thay đổi kích thước');
        return;
      }
      
      const newWidth = parseInt(widthInput.value);
      const newHeight = parseInt(heightInput.value);
      
      if (isNaN(newWidth) || isNaN(newHeight)) {
        alert('Vui lòng nhập kích thước hợp lệ');
        return;
      }
      
      if (newWidth < 30 || newWidth > 400 || newHeight < 30 || newHeight > 400) {
        alert('Kích thước phải từ 30px đến 400px');
        return;
      }
      
      // Update element dimensions
      selectedElement.style.width = `${newWidth}px`;
      selectedElement.style.height = `${newHeight}px`;
      if (selectedElement.classList.contains('design-image')) {
        selectedElement.style.objectFit = 'contain';
      }
      // Update the panel immediately
      updateSizeInputs(selectedElement);
    });
    
    // Add click handlers to make elements selectable
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('design-image') || e.target.classList.contains('design-pattern')) {
        // Remove previous selection
        document.querySelectorAll('.design-image.selected, .design-pattern.selected').forEach(el => {
          el.classList.remove('selected');
        });
        // Add selection to clicked element
        e.target.classList.add('selected');
        updateSizeInputs(e.target);
      } else if (!e.target.closest('.size-input-panel')) {
        // Remove selection when clicking elsewhere
        document.querySelectorAll('.design-image.selected, .design-pattern.selected').forEach(el => {
          el.classList.remove('selected');
        });
        updateSizeInputs(null);
      }
    });

    // Dynamically update the panel as the element is resized
    function observeResize(element) {
      if (!window.ResizeObserver) return;
      const ro = new ResizeObserver(() => {
        if (element.classList.contains('selected')) {
          widthInput.value = Math.round(element.offsetWidth);
          heightInput.value = Math.round(element.offsetHeight);
        }
      });
      ro.observe(element);
    }
    // Attach observer to all current and future design elements
    const observerConfig = { childList: true, subtree: true };
    const designCanvas = document.querySelector('.design-canvas');
    new MutationObserver(() => {
      designCanvas.querySelectorAll('.design-image, .design-pattern').forEach(el => {
        if (!el._resizeObserved) {
          observeResize(el);
          el._resizeObserved = true;
        }
      });
    }).observe(designCanvas, observerConfig);
  }

  // Initialize all functionality
  // initializeDesignTool();
  // initializeLayerPanel();
  initializeSizePanel();
  
  console.log('🎨 Design tool initialized successfully');

  // --- Save Draft Button Handler ---
  const saveDraftButton = document.getElementById('saveDraftBtn');
  console.log('Save draft button found:', saveDraftButton); // Debug log
  console.log('Save draft button HTML:', saveDraftButton ? saveDraftButton.outerHTML : 'Button not found'); // Debug log
  if (saveDraftButton) {
    console.log('Adding click event listener to save draft button...'); // Debug log
    saveDraftButton.addEventListener('click', async (e) => {
      console.log('Save draft button clicked!'); // Debug log
      console.log('Event details:', e); // Debug log
      e.preventDefault();
      e.stopPropagation();
      console.log('Calling saveDraft function...'); // Debug log
      const role = getRoleFromToken();
      if (role === 'customer') {
        // Customer: save draft to localStorage under 'customerDrafts_USERNAME' with design elements
        const username = localStorage.getItem('currentUser');
        const productCode = productCodeInput ? productCodeInput.value : '';
        const material = materialInput ? materialInput.value : '';
        const price = 150000;
        const sizeEl = document.getElementById('sizeInput');
        const notesEl = document.getElementById('notesInput');
        const size = sizeEl ? sizeEl.value : '';
        const notes = notesEl ? notesEl.value : '';
        const designImage = await captureDesignImage();
        // Collect design elements (use container's left/top/width/height)
        const designElements = Array.from(document.querySelectorAll('.design-element-container')).map(container => {
          const img = container.querySelector('img');
          return {
            type: img.classList.contains('design-image') ? 'image' : 'pattern',
            content: img.src,
            x: parseFloat(container.style.left) || 0,
            y: parseFloat(container.style.top) || 0,
            width: parseFloat(container.style.width) || 100,
            height: parseFloat(container.style.height) || 100
          };
        });
        const draft = {
          productCode,
          material,
          price,
          size,
          notes,
          designImage,
          designElements,
          color: currentColor,
          apparel: currentApparel,
          type: 'custom-design',
          timestamp: Date.now()
        };
        let drafts = JSON.parse(localStorage.getItem('customerDrafts_' + username)) || [];
        // Replace if same productCode exists
        const idx = drafts.findIndex(d => d.productCode === productCode);
        if (idx !== -1) drafts[idx] = draft; else drafts.push(draft);
        localStorage.setItem('customerDrafts_' + username, JSON.stringify(drafts));
        alert('Thiết kế nháp đã được lưu!');
        return;
      }
      // --- DESIGNER LOGIC ---
      // Only require at least one design element or shirt color changed
      const designElements = Array.from(document.querySelectorAll('.design-element-container'));
      const hasDesignElement = designElements.length > 0;
      const shirtColorChanged = currentColor !== 'white';
      console.log('Design elements found:', designElements.length);
      console.log('Current color:', currentColor);
      console.log('Shirt color changed:', shirtColorChanged);
      if (!hasDesignElement && !shirtColorChanged) {
        alert('Bạn cần thêm ít nhất một họa tiết, ảnh, hoặc đổi màu áo để lưu nháp!');
        return;
      }
      console.log('Calling saveDraft function...');
      const result = await saveDraft();
      console.log('Save draft result:', result);
    });
    console.log('Click event listener added successfully'); // Debug log
  } else {
    console.error('Save draft button not found! Check if ID "saveDraftBtn" exists in HTML');
  }

  // Function to remove all design elements (patterns and photos)
  function removeAllDesignElements() {
    // Remove all design elements from the canvas
    const designElements = designCanvas.querySelectorAll('.design-element-container, .design-text, .design-image, .design-pattern');
    designElements.forEach(el => el.remove());
    
    // Clear the design elements array
    designElementsArr = [];
    
    // Clear any selections and outlines
    selectedElement = null;
    document.querySelectorAll('.design-element-container.selected').forEach(el => {
      el.classList.remove('selected');
      el.style.outline = 'none';
    });
    
    console.log('🧹 All design elements removed');
  }

  // Load customer draft if present
  function getRoleFromToken() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role;
    } catch (e) { return null; }
  }
  const role = getRoleFromToken();
  if (role === 'customer' && localStorage.getItem('editDraft')) {
    try {
      const draft = JSON.parse(localStorage.getItem('editDraft'));
      // Fill fields
      if (draft.productCode && productCodeInput) productCodeInput.value = draft.productCode;
      if (draft.material && materialInput) materialInput.value = draft.material;
      if (draft.size && document.getElementById('sizeInput')) document.getElementById('sizeInput').value = draft.size;
      if (draft.notes && document.getElementById('notesInput')) document.getElementById('notesInput').value = draft.notes;
      if (draft.price && priceInput) priceInput.value = draft.price.toLocaleString('vi-VN') + ' VND';
      // Restore shirt color and apparel
      if (draft.color) currentColor = draft.color;
      if (draft.apparel) currentApparel = draft.apparel;
      updateProductImage();
      // Restore design elements (images/patterns) using designer logic
      if (draft.designElements && Array.isArray(draft.designElements)) {
        // Remove existing elements
        const existingDesignElements = designCanvas.querySelectorAll('.design-element-container');
        existingDesignElements.forEach(el => el.parentNode.removeChild(el));
        draft.designElements.forEach(el => {
          if (el.type === 'image' || el.type === 'pattern') {
            const img = document.createElement('img');
            img.className = el.type === 'image' ? 'design-image' : 'design-pattern';
            img.dataset.type = el.type;
            img.src = el.content;
            img.style.width = '100%';
            img.style.height = '100%';
            // Create container and set position/size
            const container = createDesignElementContainer(img, el.type);
            container.style.left = (el.x || 0) + 'px';
            container.style.top = (el.y || 0) + 'px';
            container.style.width = (el.width || 100) + 'px';
            container.style.height = (el.height || 100) + 'px';
            container.style.zIndex = '20';
            addElementToCanvas(container);
            makeDraggable(container);
          }
        });
      }
      localStorage.removeItem('editDraft');
    } catch (e) { console.error('Error loading customer draft:', e); }
  }

  // Function to get cart key
  function getCartKey() {
    const username = localStorage.getItem('currentUser');
    return username ? `cart_${username}` : 'cart_guest';
  }

  // Show/hide form fields based on role
  const designerFields = document.getElementById('designerFields');
  const customerFields = document.getElementById('customerFields');
  if (role === 'designer') {
    if (designerFields) designerFields.style.display = '';
    if (customerFields) customerFields.style.display = 'none';
  } else if (role === 'customer') {
    if (designerFields) designerFields.style.display = 'none';
    if (customerFields) customerFields.style.display = '';
  } else {
    // Default: show both if role is unknown
    if (designerFields) designerFields.style.display = '';
    if (customerFields) customerFields.style.display = '';
  }
});

// Function to capture the design canvas as an image
function captureDesignImage() {
  const canvas = document.createElement('canvas');
  const designCanvas = document.querySelector('.design-canvas');
  const productImage = document.querySelector('.product-image');

  if (!designCanvas) {
    console.error('Design canvas not found');
    return null;
  }

  // Use the actual canvas dimensions (not affected by zoom)
  canvas.width = 600; // Fixed canvas width
  canvas.height = 600; // Fixed canvas height
  const ctx = canvas.getContext('2d');

  // Helper to draw an image with proper error handling
  function drawImage(src, x, y, w, h, preserveAspectRatio = false) {
    return new Promise((resolve) => {
      const img = new window.Image();
      
      // Only set crossOrigin for external URLs
      if (src.startsWith('http') && !src.includes(window.location.hostname)) {
        img.crossOrigin = 'anonymous';
      }
      
      img.onload = function() {
        try {
          if (preserveAspectRatio) {
            // Calculate scale to fit (contain)
            const imgAspect = img.width / img.height;
            const canvasAspect = w / h;
            let drawWidth, drawHeight, drawX, drawY;
            if (imgAspect > canvasAspect) {
              drawWidth = w;
              drawHeight = w / imgAspect;
            } else {
              drawHeight = h;
              drawWidth = h * imgAspect;
            }
            drawX = x + (w - drawWidth) / 2;
            drawY = y + (h - drawHeight) / 2;
            ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
          } else {
            ctx.drawImage(img, x, y, w, h);
          }
          console.log(`✅ Successfully drew image: ${src.substring(0, 50)}...`);
          resolve(true);
        } catch (e) {
          console.warn('Error drawing image:', e, 'Source:', src);
          resolve(false);
        }
      };
      
      img.onerror = function() {
        console.warn('Could not load image:', src);
        resolve(false);
      };
      
      // For SVG images, we might need to wait a bit longer
      if (src.includes('.svg')) {
        setTimeout(() => {
          if (img.complete) {
            console.log('SVG image loaded successfully');
          } else {
            console.warn('SVG image failed to load');
          }
        }, 100);
      }
      
      img.src = src;
    });
  }

  // Draw the product image (shirt)
  const drawTasks = [];
  let productImgSrc = (productImage && productImage.src) ? productImage.src : 'resources/tshirt-white.png';
  
  // Draw the shirt image to fill the entire canvas
  drawTasks.push(drawImage(productImgSrc, 0, 0, canvas.width, canvas.height, true));

  // Draw all design elements (patterns and images)
  const elements = designCanvas.querySelectorAll('.design-element-container');
  console.log('Found design elements to capture:', elements.length);
  
  elements.forEach((container, index) => {
    const imgElement = container.querySelector('img');
    if (!imgElement) {
      console.warn('No img element found in container', index);
      return;
    }
    
    // Get the actual CSS positions and dimensions (not affected by zoom)
    const left = parseFloat(container.style.left) || 0;
    const top = parseFloat(container.style.top) || 0;
    const width = parseFloat(container.style.width) || container.offsetWidth;
    const height = parseFloat(container.style.height) || container.offsetHeight;
    
    console.log(`Drawing element ${index}:`, {
      src: imgElement.src,
      left: left,
      top: top,
      width: width,
      height: height,
      type: imgElement.dataset.type
    });
    
    // Draw the design element
    drawTasks.push(drawImage(imgElement.src, left, top, width, height, false));
  });

  // Wait for all images to be drawn, then export
  return Promise.all(drawTasks).then((results) => {
    try {
      // Count successful draws
      const successfulDraws = results.filter(result => result === true).length;
      const totalDraws = results.length;
      console.log(`📊 Capture results: ${successfulDraws}/${totalDraws} images drawn successfully`);
      
      const dataUrl = canvas.toDataURL('image/png');
      console.log('Captured design image data URL length:', dataUrl.length);
      
      // Debug: Create a test image to verify capture
      if (dataUrl.length > 1000) { // If we have a substantial image
        const testImg = new Image();
        testImg.onload = () => {
          console.log('✅ Capture verification: Image loaded successfully, dimensions:', testImg.width, 'x', testImg.height);
        };
        testImg.onerror = () => {
          console.error('❌ Capture verification: Failed to load captured image');
        };
        testImg.src = dataUrl;
      }
      
      return dataUrl;
    } catch (e) {
      console.error('Failed to capture design image:', e);
      return null;
    }
  });
}

// Test function to verify capture is working
function testCapture() {
  console.log('🧪 Testing capture function...');
  captureDesignImage().then(dataUrl => {
    if (dataUrl) {
      console.log('✅ Capture test successful, data URL length:', dataUrl.length);
      // Create a test image element to verify
      const testImg = document.createElement('img');
      testImg.style.position = 'fixed';
      testImg.style.top = '10px';
      testImg.style.right = '10px';
      testImg.style.width = '200px';
      testImg.style.height = '200px';
      testImg.style.border = '2px solid red';
      testImg.style.zIndex = '10000';
      testImg.src = dataUrl;
      document.body.appendChild(testImg);
      
      // Remove after 5 seconds
      setTimeout(() => {
        if (testImg.parentNode) {
          testImg.parentNode.removeChild(testImg);
        }
      }, 5000);
    } else {
      console.error('❌ Capture test failed');
    }
  });
}