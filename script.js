/*
 * Copyright (c) 2026 Eebii Invoice Generator
 * All Rights Reserved.
 *
 * This code is protected by copyright laws. 
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 */

// Disable Right Click
document.addEventListener('contextmenu', event => event.preventDefault()); // Remove right-click block for better UX

// Indian States List
const states = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
    "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu", "Lakshadweep", "Delhi", "Puducherry", "Ladakh", "Jammu and Kashmir"
];

// Populate State Dropdowns
function populateStates() {
    const companyState = document.getElementById('companyState');
    const clientState = document.getElementById('clientState');

    states.forEach(state => {
        const option1 = new Option(state, state);
        const option2 = new Option(state, state);
        companyState.add(option1);
        clientState.add(option2);
    });
}

// Format Currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2
    }).format(amount);
}

// Format date as DD/MM/YYYY
function formatDateDMY(dateString) {
    if (!dateString) return "-";

    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
}

// Number to Words (Indian Numbering System)
function numberToWords(num) {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    if ((num = num.toString()).length > 9) return 'overflow';
    const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return '';

    let str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'Only' : 'Only';

    return str;
}

// Add Item Row
function addItemRow() {
    const tbody = document.querySelector('#items-table-editor tbody');
    const row = document.createElement('tr');

    row.innerHTML = `
        <td><input type="text" class="item-name" placeholder="Item"></td>
        <td><input type="text" class="item-desc" placeholder="Desc"></td>
        <td><input type="number" class="item-qty" value="1" min="1"></td>
        <td><input type="number" class="item-rate" placeholder="0.00"></td>
        <td><input type="number" class="item-disc" placeholder="0" value="0"></td>
        <td>
            <select class="item-gst">
                <option value="0">0%</option>
                <option value="5">5%</option>
                <option value="12">12%</option>
                <option value="18" selected>18%</option>
                <option value="28">28%</option>
            </select>
        </td>
        <td><button class="btn-remove" onclick="removeRow(this)">×</button></td>
    `;

    tbody.appendChild(row);
    updatePreview();
}

// Remove Item Row
function removeRow(btn) {
    btn.closest('tr').remove();
    updatePreview();
}

// Toggle Company GST
function toggleCompanyGst() {
    const isChecked = document.getElementById('companyGstRegistered').checked;
    const gstGroup = document.getElementById('companyGstGroup');
    const gstInput = document.getElementById('companyGst');

    if (isChecked) {
        gstGroup.style.display = 'block';
        gstInput.setAttribute('required', 'required');
    } else {
        gstGroup.style.display = 'none';
        gstInput.removeAttribute('required');
        // gstInput.value = ''; // Optional: keep value or clear
    }
    updatePreview();
}

// Toggle Client GST
function toggleClientGst() {
    const isChecked = document.getElementById('clientGstRegistered').checked;
    const gstGroup = document.getElementById('clientGstGroup');

    if (isChecked) {
        gstGroup.style.display = 'block';
    } else {
        gstGroup.style.display = 'none';
        // document.getElementById('clientGst').value = ''; // Don't clear value, just hide
    }
    updatePreview();
}

// Update Preview
function updatePreview() {
    const isCompanyGstRegistered = document.getElementById('companyGstRegistered').checked;
    const isClientGstRegistered = document.getElementById('clientGstRegistered').checked;

    const cState = document.getElementById('companyState').value;
    const clState = document.getElementById('clientState').value;
    const isInterState = (cState && clState && cState !== clState);

    const rows = document.querySelectorAll('#items-table-editor tbody tr');

    // Calculate global totals first
    let globalSubtotal = 0;
    let globalTotalDiscount = 0;
    let globalTotalTax = 0;
    const itemsData = [];

    // Toggle GST Selection in Editor
    const editorGstSelects = document.querySelectorAll('.item-gst');
    editorGstSelects.forEach(el => el.disabled = !isCompanyGstRegistered);

    rows.forEach(row => {
        const name = row.querySelector('.item-name').value || 'Item';
        const desc = row.querySelector('.item-desc').value || '';
        const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
        const rate = parseFloat(row.querySelector('.item-rate').value) || 0;
        const disc = parseFloat(row.querySelector('.item-disc').value) || 0;
        const gstPercent = isCompanyGstRegistered ? (parseFloat(row.querySelector('.item-gst').value) || 0) : 0;

        const lineTotalBeforeDisc = qty * rate;
        const taxableValue = Math.max(0, lineTotalBeforeDisc - disc);
        const taxAmount = (taxableValue * gstPercent) / 100;
        const totalValue = taxableValue + taxAmount;

        globalSubtotal += taxableValue;
        globalTotalDiscount += disc;
        globalTotalTax += taxAmount;

        // Dynamic Height Heuristic (approximate pixels)
        // Base row height ~ 35px. Plus ~16px for every line of description.
        let estHeight = 35;
        if (desc) {
            const lines = desc.split('\n').length;
            const charWrapLines = Math.ceil(desc.length / 45); // wrap per 45 chars approx
            const totalLines = Math.max(lines, charWrapLines);
            estHeight += totalLines * 16;
        }

        itemsData.push({ name, desc, qty, rate, disc, gstPercent, taxableValue, totalValue, estHeight });
    });

    const pagesItems = [];
    let currentPageItems = [];
    let currentHeightUsed = 0;

    // Distribute items into dynamically sized pages
    for (let i = 0; i < itemsData.length; i++) {
        const item = itemsData[i];

        // A full A4 page can hold roughly 800px of table rows.
        // The footer/totals block takes roughly ~300px, so last page gets ~500px available.
        const isLastItem = (i === itemsData.length - 1);
        const availableHeight = isLastItem ? 450 : 750;

        if (currentHeightUsed + item.estHeight > availableHeight && currentPageItems.length > 0) {
            pagesItems.push(currentPageItems);
            currentPageItems = [item];
            currentHeightUsed = item.estHeight;
        } else {
            currentPageItems.push(item);
            currentHeightUsed += item.estHeight;
        }
    }
    if (currentPageItems.length > 0) {
        pagesItems.push(currentPageItems);
    }

    const container = document.getElementById('preview-pages-container');
    if (!container) return;
    container.innerHTML = '';

    const totalPages = Math.max(1, pagesItems.length);

    for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
        const pageWrapper = document.createElement('div');
        pageWrapper.innerHTML = window.pageTemplateHTML || '';
        const page = pageWrapper.firstElementChild;
        if (!page) break;

        // 1. Update Simple Text Fields
        const map = {
            'companyName': '#p-companyName',
            'companyAddress': '#p-companyAddress',
            'companyGst': '#p-companyGst',
            'companyEmail': '#p-companyEmail',
            'companyPhone': '#p-companyPhone',
            'clientName': '#p-clientName',
            'clientAddress': '#p-clientAddress',
            'clientGst': '#p-clientGst',
            'clientState': '#p-clientState',
            'clientPhone': '#p-clientPhone',
            'invoiceNumber': '#p-invoiceNumber',
            'invoiceDate': '#p-invoiceDate',
            'dueDate': '#p-dueDate',
        };

        for (const [inputId, selector] of Object.entries(map)) {
            const input = document.getElementById(inputId);
            const preview = page.querySelector(selector);
            if (input && preview) {
                if (inputId === 'invoiceDate' || inputId === 'dueDate') {
                    preview.textContent = formatDateDMY(input.value);
                } else {
                    const val = input.value.trim();
                    preview.textContent = val || (input.getAttribute('placeholder') !== 'street' ? input.getAttribute('placeholder') : '-');

                    if (['companyEmail', 'companyPhone', 'clientPhone'].includes(inputId)) {
                        const pContainer = preview.parentNode;
                        if (pContainer) pContainer.style.display = val ? 'block' : 'none';
                    }
                }

                if (inputId === 'companyName') {
                    const sig = page.querySelector('#p-companyName-sig');
                    if (sig) sig.textContent = input.value || 'Your Company';
                }

                if (inputId === 'companyGst') {
                    const pContainer = preview.parentNode;
                    if (pContainer) pContainer.style.display = isCompanyGstRegistered ? 'block' : 'none';
                }

                if (inputId === 'clientGst') {
                    const gstLine = page.querySelector('#p-clientGst-line');
                    if (gstLine) gstLine.style.display = (isClientGstRegistered && input.value) ? 'block' : 'none';
                }
            }
        }

        const titleEl = page.querySelector('#p-invoiceTitle');
        if (titleEl) titleEl.textContent = isCompanyGstRegistered ? 'TAX INVOICE' : 'INVOICE';

        // Address & State
        const companyAddress = document.getElementById('companyAddress').value;
        const clientAddress = document.getElementById('clientAddress').value;

        const pCompanyAddress = page.querySelector('#p-companyAddress');
        if (pCompanyAddress) {
            if (companyAddress || cState) {
                let addrHtml = companyAddress ? companyAddress.replace(/\n/g, '<br>') : '';
                if (cState) addrHtml += (addrHtml ? '<br>' : '') + cState;
                pCompanyAddress.innerHTML = addrHtml;
            } else {
                pCompanyAddress.textContent = 'Address Line 1, City';
            }
        }

        const pClientAddress = page.querySelector('#p-clientAddress');
        if (pClientAddress && clientAddress) pClientAddress.innerHTML = clientAddress.replace(/\n/g, '<br>');

        const pClientState = page.querySelector('#p-clientState');
        if (pClientState && clState) pClientState.textContent = clState;

        const pBillToBlock = page.querySelector('#p-billToBlock');
        const showBillToAllPagesCheckbox = document.getElementById('showBillToAllPages');
        const showBillToAllPages = showBillToAllPagesCheckbox ? showBillToAllPagesCheckbox.checked : false;

        if (pBillToBlock) {
            pBillToBlock.style.display = (pageIdx === 0 || showBillToAllPages) ? 'block' : 'none';
            if (pageIdx > 0 && !showBillToAllPages) {
                pBillToBlock.style.marginTop = '-20px'; // compress spacing slightly when hidden
            } else if (pageIdx > 0 && showBillToAllPages) {
                pBillToBlock.style.marginTop = '0'; // reset if previously compressed but now shown
            }
        }

        // Process Items for this page
        const previewBody = page.querySelector('#p-items-body');
        if (previewBody) previewBody.innerHTML = '';

        const gstHeaders = page.querySelectorAll('.gst-column');
        gstHeaders.forEach(el => el.style.display = isCompanyGstRegistered ? '' : 'none');

        const pageItemsArray = pagesItems[pageIdx] || [];

        for (let i = 0; i < pageItemsArray.length; i++) {
            const item = pageItemsArray[i];
            const tr = document.createElement('tr');
            const nameDisplay = item.desc ? `<strong>${item.name}</strong><br><small style="color:#666">${item.desc}</small>` : item.name;
            let gstCellInfo = isCompanyGstRegistered ? `<td class="text-right gst-column">${item.gstPercent}%</td>` : `<td class="text-right gst-column" style="display:none"></td>`;

            tr.innerHTML = `
                <td>${nameDisplay}</td>
                <td class="text-right">${item.qty}</td>
                <td class="text-right">${item.rate.toFixed(2)}</td>
                <td class="text-right">${item.disc.toFixed(2)}</td>
                <td class="text-right">${item.taxableValue.toFixed(2)}</td>
                ${gstCellInfo}
                <td class="text-right">${item.totalValue.toFixed(2)}</td>
            `;
            if (previewBody) previewBody.appendChild(tr);
        }

        // Totals & Footer visibility
        const isLastPage = (pageIdx === totalPages - 1);
        const pdfTotals = page.querySelector('.pdf-totals');
        const pdfFooter = page.querySelector('.pdf-footer');

        if (isLastPage) {
            if (pdfTotals) pdfTotals.style.display = 'flex';
            if (pdfFooter) pdfFooter.style.display = 'block';

            // Show totals
            const pSub = page.querySelector('#p-subtotal');
            if (pSub) pSub.textContent = formatCurrency(globalSubtotal);

            const pDisc = page.querySelector('#p-discountTotal');
            if (pDisc) pDisc.textContent = formatCurrency(globalTotalDiscount);

            const cgstRow = page.querySelector('#p-cgst-row');
            const sgstRow = page.querySelector('#p-sgst-row');
            const igstRow = page.querySelector('#p-igst-row');

            if (isCompanyGstRegistered) {
                if (isInterState) {
                    if (cgstRow) cgstRow.style.display = 'none';
                    if (sgstRow) sgstRow.style.display = 'none';
                    if (igstRow) igstRow.style.display = 'flex';
                    if (page.querySelector('#p-igst')) page.querySelector('#p-igst').textContent = formatCurrency(globalTotalTax);
                } else {
                    if (cgstRow) cgstRow.style.display = 'flex';
                    if (sgstRow) sgstRow.style.display = 'flex';
                    if (igstRow) igstRow.style.display = 'none';
                    const splitTax = globalTotalTax / 2;
                    if (page.querySelector('#p-cgst')) page.querySelector('#p-cgst').textContent = formatCurrency(splitTax);
                    if (page.querySelector('#p-sgst')) page.querySelector('#p-sgst').textContent = formatCurrency(splitTax);
                }
            } else {
                if (cgstRow) cgstRow.style.display = 'none';
                if (sgstRow) sgstRow.style.display = 'none';
                if (igstRow) igstRow.style.display = 'none';
            }

            const grandTotal = globalSubtotal + globalTotalTax;
            if (page.querySelector('#p-grandTotal')) page.querySelector('#p-grandTotal').textContent = formatCurrency(grandTotal);
            if (page.querySelector('#p-amountInWords')) {
                page.querySelector('#p-amountInWords').textContent = numberToWords(Math.round(grandTotal)) + (grandTotal > 0 ? ' Rupees Only' : '');
            }
        } else {
            if (pdfTotals) pdfTotals.style.display = 'none';
            if (pdfFooter) pdfFooter.style.display = 'none';
        }

        container.appendChild(page);
    }

    managePreviewScale();
}

// Manage dynamic scale of preview to fit seamlessly on any screen
function managePreviewScale() {
    const container = document.getElementById('preview-pages-container');
    const pages = document.querySelectorAll('.a4-page');
    if (!container || pages.length === 0) return;

    const nativeWidth = 794;
    let availableWidth = container.clientWidth;
    // Add 10px safe margin padding
    let scale = (availableWidth - 20) / nativeWidth;

    // Don't upscale past 100% on huge desktop screens
    if (scale > 1) scale = 1;

    pages.forEach((page, index) => {
        // Find left offset to center exactly inside viewport naturally
        const currentScaledWidth = nativeWidth * scale;
        const leftMargin = (availableWidth - currentScaledWidth) / 2;

        page.style.transform = `scale(${scale})`;
        page.style.transformOrigin = `top left`;
        page.style.marginLeft = `${Math.max(0, leftMargin)}px`;

        // Compensate for CSS transform keeping physical height in DOM
        const scaledHeight = page.offsetHeight * scale;
        const offsetGap = page.offsetHeight - scaledHeight;

        // Leave tiny space between pages, but strip the massive underlying dead zone box
        page.style.marginBottom = `-${offsetGap - 20}px`;
    });
}

// Download PDF
window.downloadPDF = async function () {
    const pages = document.querySelectorAll('.a4-page');
    const invoiceNum = document.getElementById('invoiceNumber').value || 'Invoice';

    if (typeof html2canvas === 'undefined' || typeof jspdf === 'undefined') {
        alert("PDF libraries are still loading. Please try again in a moment.");
        return;
    }

    const simpleBtnInitialText = document.querySelector('.btn-download').innerText;
    document.querySelector('.btn-download').innerText = 'Generating...';

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');

    // Reset scaling and styling temporarily for clean PDF generation
    pages.forEach(page => {
        page.style.transform = 'none';
        page.style.marginLeft = '0px';
        page.style.marginBottom = '0px';
        page.style.boxShadow = 'none';
    });
    
    // Allow the DOM to update to ensure html2canvas paints the non-scaled version
    await new Promise(resolve => setTimeout(resolve, 50));

    for (let i = 0; i < pages.length; i++) {
        if (i > 0) pdf.addPage();
        const element = pages[i];

        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false
            });
            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        } catch (err) {
            console.error(err);
        }
    }

    // Restore styling and recalculate scaling
    pages.forEach(page => {
        page.style.boxShadow = '';
    });
    managePreviewScale();

    pdf.save(`${invoiceNum}.pdf`);
    document.querySelector('.btn-download').innerText = simpleBtnInitialText;
};

/* Initialization */
window.pageTemplateHTML = '';

document.addEventListener('DOMContentLoaded', () => {
    populateStates();

    const container = document.getElementById('preview-pages-container');
    if (container) {
        window.pageTemplateHTML = container.innerHTML;
    }

    // Header Time
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('invoiceDate').value = today;

    // Add one initial row
    addItemRow();

    // Listeners
    document.getElementById('invoice-form').addEventListener('input', updatePreview);
    document.getElementById('invoice-form').addEventListener('change', updatePreview);
    window.addEventListener('resize', () => { setTimeout(managePreviewScale, 50); });
});

