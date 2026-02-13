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

    // 1. Update Simple Text Fields
    const map = {
        'companyName': 'p-companyName',
        'companyAddress': 'p-companyAddress',
        'companyGst': 'p-companyGst',
        'companyEmail': 'p-companyEmail',
        'clientName': 'p-clientName',
        'clientAddress': 'p-clientAddress',
        'clientGst': 'p-clientGst',
        'clientState': 'p-clientState',
        'invoiceNumber': 'p-invoiceNumber',
        'invoiceDate': 'p-invoiceDate',
        'dueDate': 'p-dueDate',
    };

    for (const [inputId, previewId] of Object.entries(map)) {
        const input = document.getElementById(inputId);
        const preview = document.getElementById(previewId);
        if (input && preview) {
            preview.textContent = input.value || (input.getAttribute('placeholder') !== 'street' ? input.getAttribute('placeholder') : '-');
            if (inputId === 'companyName') document.getElementById('p-companyName-sig').textContent = input.value || 'Your Company';

            // Company GST Visibility in Preview
            if (inputId === 'companyGst') {
                const pContainer = document.getElementById('p-companyGst').parentNode;
                if (pContainer) pContainer.style.display = isCompanyGstRegistered ? 'block' : 'none';
            }

            // Client GST Visibility
            if (inputId === 'clientGst') {
                const gstLine = document.getElementById('p-clientGst-line');
                if (gstLine) {
                    // Show only if checked AND has value
                    gstLine.style.display = (isClientGstRegistered && input.value) ? 'block' : 'none';
                }
            }
        }
    }

    // Update Title
    const titleEl = document.getElementById('p-invoiceTitle');
    titleEl.textContent = isCompanyGstRegistered ? 'TAX INVOICE' : 'INVOICE';

    // 2. Determine tax type
    const cState = document.getElementById('companyState').value;
    const clState = document.getElementById('clientState').value;
    const isInterState = (cState && clState && cState !== clState);

    // Explicitly update Address + State in Preview
    const companyAddress = document.getElementById('companyAddress').value;
    const clientAddress = document.getElementById('clientAddress').value;

    if (companyAddress || cState) {
        // Replace newlines with <br> and add State on a new line
        let addrHtml = companyAddress ? companyAddress.replace(/\n/g, '<br>') : '';
        if (cState) {
            addrHtml += (addrHtml ? '<br>' : '') + cState;
        }
        document.getElementById('p-companyAddress').innerHTML = addrHtml; // Use innerHTML
    } else {
        document.getElementById('p-companyAddress').textContent = 'Address Line 1, City';
    }

    // Client Address update (Need to handle similar logic or just update the address part if we keep State separate below)
    // The previous HTML has <p id="p-clientAddress">Client Address</p> and <p>Place of Supply: <span id="p-clientState">-</span></p>
    // User wants State on next line.

    if (clientAddress) {
        document.getElementById('p-clientAddress').innerHTML = clientAddress.replace(/\n/g, '<br>');
    }

    // Check Client State update (handled by map for p-clientState, but let's leave it as "Place of Supply: State")
    // If user implies standard address format for client too:
    /*
        Client Name
        Address Line 1
        Address Line 2
        State
        GSTIN
    */
    // Let's stick to the existing "Place of Supply" line for Client as it's standard for invoices ("Bill To"), 
    // BUT ensure the address itself supports new lines.

    // Explicitly check Client State update
    if (clState) {
        document.getElementById('p-clientState').textContent = clState;
    }

    // 3. Process Items
    const rows = document.querySelectorAll('#items-table-editor tbody tr');
    const previewBody = document.getElementById('p-items-body');
    previewBody.innerHTML = '';

    let subtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;

    // Toggle GST Columns in Preview
    const gstHeaders = document.querySelectorAll('.gst-column');
    gstHeaders.forEach(el => el.style.display = isCompanyGstRegistered ? '' : 'none');

    // Toggle GST Selection in Editor
    const editorGstSelects = document.querySelectorAll('.item-gst');
    editorGstSelects.forEach(el => el.disabled = !isCompanyGstRegistered);


    rows.forEach(row => {
        const name = row.querySelector('.item-name').value || 'Item';
        const desc = row.querySelector('.item-desc').value || '';
        const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
        const rate = parseFloat(row.querySelector('.item-rate').value) || 0;
        const disc = parseFloat(row.querySelector('.item-disc').value) || 0;

        // If Company not registered, tax is 0 effectively for invoice calculation
        const gstPercent = isCompanyGstRegistered ? (parseFloat(row.querySelector('.item-gst').value) || 0) : 0;

        const lineTotalBeforeDisc = qty * rate;
        const taxableValue = Math.max(0, lineTotalBeforeDisc - disc);
        const taxAmount = (taxableValue * gstPercent) / 100;
        const totalValue = taxableValue + taxAmount;

        subtotal += taxableValue;
        totalDiscount += disc;
        totalTax += taxAmount;

        // Add to Preview Table
        const tr = document.createElement('tr');
        const nameDisplay = desc ? `<strong>${name}</strong><br><small style="color:#666">${desc}</small>` : name;

        let gstCellInfo = '';
        if (isCompanyGstRegistered) {
            gstCellInfo = `<td class="text-right gst-column">${gstPercent}%</td>`;
        } else {
            gstCellInfo = `<td class="text-right gst-column" style="display:none"></td>`;
        }

        tr.innerHTML = `
            <td>${nameDisplay}</td>
            <td class="text-right">${qty}</td>
            <td class="text-right">${rate.toFixed(2)}</td>
            <td class="text-right">${disc.toFixed(2)}</td>
            <td class="text-right">${taxableValue.toFixed(2)}</td>
            ${gstCellInfo}
            <td class="text-right">${totalValue.toFixed(2)}</td>
        `;
        previewBody.appendChild(tr);
    });

    // 4. Update Totals Section
    document.getElementById('p-subtotal').textContent = formatCurrency(subtotal);
    document.getElementById('p-discountTotal').textContent = formatCurrency(totalDiscount);

    const cgstRow = document.getElementById('p-cgst-row');
    const sgstRow = document.getElementById('p-sgst-row');
    const igstRow = document.getElementById('p-igst-row');

    if (isCompanyGstRegistered) {
        if (isInterState) {
            // IGST
            cgstRow.style.display = 'none';
            sgstRow.style.display = 'none';
            igstRow.style.display = 'flex';
            document.getElementById('p-igst').textContent = formatCurrency(totalTax);
        } else {
            // CGST + SGST
            cgstRow.style.display = 'flex';
            sgstRow.style.display = 'flex';
            igstRow.style.display = 'none';
            const splitTax = totalTax / 2;
            document.getElementById('p-cgst').textContent = formatCurrency(splitTax);
            document.getElementById('p-sgst').textContent = formatCurrency(splitTax);
        }
    } else {
        // Hide all tax rows
        cgstRow.style.display = 'none';
        sgstRow.style.display = 'none';
        igstRow.style.display = 'none';
    }

    const grandTotal = subtotal + totalTax;
    document.getElementById('p-grandTotal').textContent = formatCurrency(grandTotal);

    // Amount in Words
    document.getElementById('p-amountInWords').textContent = numberToWords(Math.round(grandTotal)) + (grandTotal > 0 ? ' Rupees Only' : '');
}

// Download PDF
window.downloadPDF = function () {
    const element = document.getElementById('invoice-preview');
    const invoiceNum = document.getElementById('invoiceNumber').value || 'Invoice';

    // Check if html2canvas and jspdf are loaded
    if (typeof html2canvas === 'undefined' || typeof jspdf === 'undefined') {
        alert("PDF libraries are still loading. Please try again in a moment.");
        return;
    }

    const simpleBtnInitialText = document.querySelector('.btn-download').innerText;
    document.querySelector('.btn-download').innerText = 'Generating...';

    html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${invoiceNum}.pdf`);

        document.querySelector('.btn-download').innerText = simpleBtnInitialText;
    });
};

/* Initialization */
document.addEventListener('DOMContentLoaded', () => {
    populateStates();

    // Header Time
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('invoiceDate').value = today;

    // Add one initial row
    addItemRow();

    // Listeners
    document.getElementById('invoice-form').addEventListener('input', updatePreview);
    document.getElementById('invoice-form').addEventListener('change', updatePreview);
});
