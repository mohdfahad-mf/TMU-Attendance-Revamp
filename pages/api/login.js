import puppeteer from 'puppeteer-core';
import chrome from '@sparticuz/chromium';
import { parse } from 'node-html-parser';

// In-memory storage
let userStore = {
  name: '',
  attendanceData: []
};

export const config = {
  api: {
    bodyParser: true,
  },
};

async function setupBrowser() {
  const executablePath = await chrome.executablePath;
  
  const browser = await puppeteer.launch({
    args: chrome.args,
    executablePath: executablePath,
    headless: true,
  });
  
  return browser;
}

async function getUserInfoAndAttendance(page) {
  await page.goto("http://portal3.tmu.ac.in/Student/ViewAttendance.aspx");
  const content = await page.content();
  const root = parse(content);
  
  const userName = root.querySelector("#lblName")?.text.trim() || "Unknown";
  
  const data = [];
  for (let i = 0; i < 7; i++) {
    const course = root.querySelector(`#ContentPlaceHolder1_grdAttendanceReport_lblCourse_${i}`)?.text.trim();
    const present = parseInt(root.querySelector(`#ContentPlaceHolder1_grdAttendanceReport_lbllecture_${i}`)?.text.trim() || '0');
    const total = parseInt(root.querySelector(`#ContentPlaceHolder1_grdAttendanceReport_lblDel_${i}`)?.text.trim() || '0');
    const percentage = root.querySelector(`#ContentPlaceHolder1_grdAttendanceReport_lblPer_${i}`)?.text.trim();
    
    data.push([
      i + 1,
      course || 'N/A',
      present,
      total - present,
      total,
      percentage || 'N/A'
    ]);
  }
  
  return { userName, data };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body;

  try {
    const browser = await setupBrowser();
    const page = await browser.newPage();
    
    // Login
    await page.goto("https://portal3.tmu.ac.in/");
    await page.type("#txtUserid", username);
    await page.type("#txtpassword", password);
    await page.click("#ImgBttn_Login");
    
    // Wait for navigation and check for login success
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    
    const { userName, data } = await getUserInfoAndAttendance(page);
    
    // Store in memory
    userStore = {
      name: userName,
      attendanceData: data
    };
    
    await browser.close();
    
    res.redirect(303, '/attendance');
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
}
