const { F_Select, F_Delete, F_Insert, Api_Insert } = require('../controller/masterController');
const { numberToWords } = require('../model/masterModel');
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
    var pax_id = user ? user.BANK_ID : data.bank_id;
    if(pax_id > 0){
        var fields = "*",
            table_name = `TD_MEMB_APPLICATION`,
            where = data.id > 0 ? `SL_NO=${data.id}` : `DELETE_FLAG != 'Y'`,
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
    }else{
        res.redirect('/admin/login')
    }
}

const loanApplication = async (req, res, flag, encFlag) => {
    var data = req.query
    var user = req.session.user
    var pax_id = user ? user.BANK_ID : data.bank_id;
    if(pax_id > 0){
        var fields = "*",
            table_name = `TD_GEN_LOAN_APPLICATION`,
            where = data.id > 0 ? `SL_NO=${data.id}` : `DELETE_FLAG != 'Y'`,
            order = null,
            dtFlag = data.id > 0 ? 0 : 1;
        var resDt = await F_Select(pax_id, fields, table_name, where, order, dtFlag)
        if(data.id > 0){
            var amt_str = resDt.suc > 0 ? (resDt.msg.APPLY_LOAN_AMT ? await numberToWords(resDt.msg.APPLY_LOAN_AMT) : '') : '';
            var viewData = {title: "General Loan Application Form", flag, encFlag, id: data.id, dateFormat, appDt: resDt.suc > 0 ? resDt.msg : {}, amt_str}
            res.render('application/genLoanView', viewData)
        }else{
            var viewData = {heading: "Application Form", sub_heading: "General Loan Application Form", dateFormat, flag, encFlag, appDt: resDt.suc > 0 ? resDt.msg : []}
            res.render('application/view', viewData)
        }
    }else{
        res.redirect('/admin/login')
    }
}

const addShareApplication = async (req, res, flag, encFlag) => {
    var data = req.query
    var user = req.session.user
    var pax_id = user ? user.BANK_ID : data.bank_id;
    if(pax_id > 0){
        var fields = "*",
            table_name = `TD_ADD_SHARE_APPLICATION`,
            where = data.id > 0 ? `SL_NO=${data.id}` : `DELETE_FLAG != 'Y'`,
            order = null,
            dtFlag = data.id > 0 ? 0 : 1;
        var resDt = await F_Select(pax_id, fields, table_name, where, order, dtFlag)
        if(data.id > 0){
            var viewData = {title: "Additional Share Application Form", flag, encFlag, id: data.id, dateFormat, appDt: resDt.suc > 0 ? resDt.msg : {}}
            res.render('application/addShareView', viewData)
        }else{
            var viewData = {heading: "Application Form", sub_heading: "Additional Share Application Form", dateFormat, flag, encFlag, appDt: resDt.suc > 0 ? resDt.msg : []}
            res.render('application/view', viewData)
        }
    }else{
        res.redirect('/admin/login')
    }
}

appFormRouter.get('/application_form_delete', async (req, res) => {
    var data = req.query
    var encFlag = data.flag,
    user = req.session.user, table_name, fields, whr,
    datetime = dateFormat(new Date(), "dd-mmm-yy");
    var flag = new Buffer.from(encFlag, 'base64').toString();

    switch (flag) {
        case 'M':
            table_name = 'TD_MEMB_APPLICATION'
            fields = `DELETE_FLAG = :0, MODIFIED_BY = :1, MODIFIED_DT = :2`
            values = ['Y', user.USER_NAME, datetime]
            whr = `SL_NO=${data.id}`;
            break;
        case 'G':
            table_name = 'TD_GEN_LOAN_APPLICATION'
            fields = `RESET_REMARKS = :0, MODIFIED_BY = :1, MODIFIED_DT = :2`
            values = ['Y', user.USER_NAME, datetime]
            whr = `SL_NO=${data.id}`;
            break;
        case 'A':
            table_name = 'TD_ADD_SHARE_APPLICATION'
            fields = `RESET_REMARKS = :0, MODIFIED_BY = :1, MODIFIED_DT = :2`
            values = ['Y', user.USER_NAME, datetime]
            whr = `SL_NO=${data.id}`;
            break;
        default:
            table_name = null
            fields = null;
            values = null
            whr = null;
            break;
    }

    var res_dt = await Api_Insert(user.BANK_ID, table_name, fields, null, values, whr, 1)

    if (res_dt.suc > 0) {
        req.session.message = {
          type: "success",
          message: "Successfully Deleted!!",
        };
        res.redirect(`/admin/application_form?flag=${encFlag}`);
    } else {
        req.session.message = {
          type: "danger",
          message: "Data Not Deleted!!",
        };
        res.redirect(`/admin/application_form?flag=${encFlag}`);
    }
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