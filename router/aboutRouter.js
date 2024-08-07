const { ABOUT_TYPE_LIST } = require('../model/masterModel')

const AboutRouter = require('express').Router()

AboutRouter.get('/entry_about', async (req, res) => {
    var about_list = ABOUT_TYPE_LIST
    var data = {about_list, heading: "Entry About Section"}
    res.render('about_sec/entry', data)
})

AboutRouter.post('/entry_about', async (req, res) => {
    
})

module.exports = {AboutRouter}