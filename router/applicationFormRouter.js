const { F_Select } = require('../controller/masterController');

const appFormRouter = require('express').Router(),
dateFormat = require('dateformat');

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
    var pax_id = user.BANK_ID,
        fields = "*",
        table_name = `TD_MEMB_APPLICATION`,
        where = data.id > 0 ? `SL_NO=${data.id}` : null,
        order = null,
        dtFlag = data.id > 0 ? 0 : 1;
    var resDt = await F_Select(pax_id, fields, table_name, where, order, dtFlag)
    if(data.id > 0){
        var viewData = {title: "Membership Application Form", dateFormat, appDt: resDt.suc > 0 ? resDt.msg : {}}
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

module.exports = {appFormRouter}