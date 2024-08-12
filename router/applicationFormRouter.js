const { F_Select } = require('../controller/masterController');
const appFormRouter = require('express').Router(),
dateFormat = require('dateformat'),
puppeteer = require('puppeteer'),
path = require('path');
require('dotenv').config();

appFormRouter.get('/application_form', async (req, res, next) => {
    var data = req.query
    var encFlag = data.flag
    var flag = new Buffer.from(encFlag, 'base64').toString();
    switch (flag) {
        case 'M':
            await membershipApplication(req, res, flag, encFlag)
            next();
            break;
        case 'G':
            await loanApplication(req, res, flag, encFlag)
            next();
            break;
        case 'A':
            await addShareApplication(req, res, flag, encFlag)
            next();
            break;
        default:
            membershipApplication(req, res, flag, encFlag)
            next();
            break;
    }
})

const membershipApplication = async (req, res, flag, encFlag) => {
    var data = req.query
    var user = req.session.user
    var pax_id = user ? user.BANK_ID : data.bank_id,
        fields = "*",
        table_name = `TD_MEMB_APPLICATION`,
        where = data.id > 0 ? `SL_NO=${data.id}` : null,
        order = null,
        dtFlag = data.id > 0 ? 0 : 1;
    var resDt = await F_Select(pax_id, fields, table_name, where, order, dtFlag)
    if(data.id > 0){
        var viewData = {title: "Membership Application Form", flag, encFlag, id: data.id, dateFormat, appDt: resDt.suc > 0 ? resDt.msg : {}}
        res.render('application/membAppView', viewData)
    }else{
        var viewData = {heading: "Application Form", sub_heading: "Membership Application Form", dateFormat, flag, encFlag, appDt: resDt.suc > 0 ? resDt.msg : []}
        res.render('application/view', viewData)
    }
}

const loanApplication = async (req, res, flag, encFlag) => {
    var data = req.query
    var user = req.session.user
    var pax_id = user.BANK_ID,
        fields = "*",
        table_name = `TD_GEN_LOAN_APPLICATION`,
        where = data.id > 0 ? `SL_NO=${data.id}` : null,
        order = null,
        dtFlag = data.id > 0 ? 0 : 1;
    var resDt = await F_Select(pax_id, fields, table_name, where, order, dtFlag)
    if(data.id > 0){
        var viewData = {title: "General Loan Application Form", dateFormat, appDt: resDt.suc > 0 ? resDt.msg : {}}
        res.render('application/genLoanView', viewData)
    }else{
        var viewData = {heading: "Application Form", sub_heading: "General Loan Application Form", dateFormat, flag, encFlag, appDt: resDt.suc > 0 ? resDt.msg : []}
        res.render('application/view', viewData)
    }
}

const addShareApplication = async (req, res, flag, encFlag) => {
    var data = req.query
    var user = req.session.user
    var pax_id = user.BANK_ID,
        fields = "*",
        table_name = `TD_ADD_SHARE_APPLICATION`,
        where = data.id > 0 ? `SL_NO=${data.id}` : null,
        order = null,
        dtFlag = data.id > 0 ? 0 : 1;
    var resDt = await F_Select(pax_id, fields, table_name, where, order, dtFlag)
    if(data.id > 0){
        var viewData = {title: "Additional Share Application Form", dateFormat, appDt: resDt.suc > 0 ? resDt.msg : {}}
        res.render('application/addShareView', viewData)
    }else{
        var viewData = {heading: "Application Form", sub_heading: "Additional Share Application Form", dateFormat, flag, encFlag, appDt: resDt.suc > 0 ? resDt.msg : []}
        res.render('application/view', viewData)
    }
}

appFormRouter.get('/dow_pdf', async (req, res) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const htmlContent = `
    <html>
    <head><title>Test PDF</title></head>
    <body><h1>Hello, World!</h1></body>
    </html>
`;

await page.setContent(htmlContent);
const pdfBuffer = await page.pdf({ format: 'A4' });
const filePath = path.join('assets', 'uploads', 'form2.pdf');
require('fs').writeFileSync(filePath, pdfBuffer);

res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': 'attachment; filename=form.pdf',
    'Content-Length': pdfBuffer.length
});
res.send(pdfBuffer);
})

appFormRouter.get('/download-pdf', async (req, res) => {
    try{
        var data = req.query
        const browser = await puppeteer.launch({headless: 'new'});
        const page = await browser.newPage();
    
        // Replace with your form page URL or HTML content

        await page.goto(`${process.env.BASE_URL}/admin/application_form?flag=${data.encFlag}&id=${data.id}&bank_id=${data.bank_id}`, { waitUntil: 'networkidle0' });
    
        // Generate PDF
        const pdfBuffer = await page.pdf({ 
            format: 'A4',
            printBackground: true,
            margin: { top: "20px", bottom: "20px", left: "20px", right: "20px" }
         });
    
        await browser.close();
    
        // Define file path to save PDF on the server (optional)
        // const filePath = path.join('assets', 'uploads', 'form1.pdf');
        // require('fs').writeFileSync(filePath, pdfBuffer);

        // console.log(pdfBuffer);
        
    
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="form.pdf"',
            'Content-Length': pdfBuffer.length
        });

        // Send the PDF buffer as a binary response
        res.end(pdfBuffer, 'binary');
    }catch(err){
        console.log(err);
        res.send(err)
    }
});

module.exports = {appFormRouter}