#!/usr/bin/env node

import chalk from 'chalk';
import inquirer from 'inquirer';
import gradient from 'gradient-string';
import { createSpinner } from 'nanospinner';
import figlet from 'figlet';
import axios from 'axios';
import fs from 'fs';
import cheerio from 'cheerio';
import { Console } from 'console';
import https from 'https';

console.log(chalk.bgGreen("Starting PH Gif Downloader..."));

let userURL;
// base url should be like https://www.pornhub.com/users/yajhal
let gifURLExtension = '/gifs/favorites?page=';
let baseURL = "https://dl.phncdn.com/pics/gifs/";
let baseURLSuffix = ".web";
let currentPage = 1;
let maxPages = 10;
let canContinue = true;
let downloadProgress = 0;

let totalWEBMs;

const WEBMsPerPage = 52;

const gifIDs = [];
const gifURLTag = [];
const webmURLs = [];
const webmTitles = [];
const sleep = (ms = 2000) => new Promise((r) => setTimeout(r, ms));

async function askUrl()
{
    const answers = await inquirer.prompt({
        name: 'user_url',
        type: 'input',
        message: 'What is your user profile link?',
        default()
        {
            return "";
        }
    });
    userURL = answers.user_url;
}

async function doubleCheckUrl()
{
    const answers = await inquirer.prompt({
        name: 'check_response',
        type: 'list',
        message: 'Your user profile URL is: ' + chalk.bgBlue(userURL) + ', is this corect?',
        choices: [
            'yes',
            'no'
        ],
        default()
        {
            return "";
        }
    });
    if(answers.check_response === 'yes')
    {
        await spinnerWait();
        console.log(chalk.bgGreen('Confirmed:') + ' User URL is set correctly.');
    }
    else
    {
        process.exit(1);
    }
}

async function title()
{
    const title = "Pornhub Gif Downloader"
    figlet(title,(err, data) =>
    {
        console.log(gradient.pastel.multiline(data));
    });

    await sleep();
}

async function spinnerWait()
{
    const spinner = createSpinner('Waiting...').start();
    await sleep();
    spinner.success('');
}

function getGifs()
{
    console.log('Page: ' +currentPage + '/'+maxPages+ ': Sending HTTP Request...');
    axios.get(userURL+gifURLExtension+currentPage)
        .then((response) => {

            //CREATE A WAY TO DEBUG RESPONSE .HTML FILE
            const output = fs.createWriteStream('./response.html');
            const errorOutput = fs.createWriteStream('./response.html');
            // custom simple logger
            const logger = new Console(output, errorOutput);
            logger.log(response);
            if(response.data.includes("No GIFs to show"))
            {
                console.log("NO Gifs here! You have found the end!")
                canContinue = false;
                console.log(webmURLs);
                return;
            }
            // NOW USE CHEERIO TO FIND GIFS
            console.log("Request sent looping through data...")
            const $ = cheerio.load(response.data);
            $('.gifLi', response.data).each(function(){

                let t = $(this).find('a').find('img').attr('data-gif-url');
                let g = $(this).attr('id');
                gifIDs.push(g);
                t = t.substring(32,43);
                g = g.substring(3)+'a';
                webmURLs.push(baseURL + t + '/' + g + '.webm');
                webmTitles.push($(this).find('img').attr('alt'));
            })
            currentPage++;
            if(currentPage < maxPages)
            {
                getGifs();
            }
            else
            {
                downloadGifs();
            }
        });
}

async function initializeGifs()
{
    axios.get(userURL+gifURLExtension+currentPage)
        .then((response) => {
            const $ = cheerio.load(response.data);
            totalWEBMs = $('.showingInfo', response.data).contents().text();
            totalWEBMs = totalWEBMs.slice(43);
            totalWEBMs = totalWEBMs.substring(0,totalWEBMs.indexOf(' '));
            maxPages = Math.ceil(totalWEBMs/WEBMsPerPage);
        });
        await spinnerWait();
}
function downloadGifs()
{
    for(let i = 0; i < webmURLs.length; i++)
    {
        if(fs.existsSync(gifIDs[i]+'.webm'))
        {
            console.log("file already exists...");
        }
        else
        {
            const file = fs.createWriteStream(gifIDs[i]+'.webm');
            const request = https.get(webmURLs[i], function(response)
            {
                response.pipe(file);
                file.on("finish", () => {
                    file.close();
                    console.log("Download Completed for " + gifIDs[i] + ".webm");
                });
            }).on('error', function(err, file)
            {
                fs.unlink(file)
            })
        }
    }
    console.log("Downloads are completed!");
    process.exit(1);

}

await title();
await askUrl();
await doubleCheckUrl();
await initializeGifs();
getGifs();