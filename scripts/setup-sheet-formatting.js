const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

// 1. Manually load .env.local
const envPath = path.resolve(__dirname, '../.env.local');
if (!fs.existsSync(envPath)) {
    console.error('.env.local not found at', envPath);
    process.exit(1);
}

const envConfig = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envConfig.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        let key = match[1].trim();
        let value = match[2].trim();
        // Remove quotes if present
        if (value.startsWith('"') && value.endsWith('"')) {
            value = value.slice(1, -1);
        }
        // Handle newlines in private key
        if (key === 'GOOGLE_SHEETS_PRIVATE_KEY') {
            value = value.replace(/\\n/g, '\n');
        }
        envVars[key] = value;
    }
});

const clientEmail = envVars.GOOGLE_SHEETS_CLIENT_EMAIL;
const privateKey = envVars.GOOGLE_SHEETS_PRIVATE_KEY;
const sheetId = envVars.GOOGLE_SHEETS_ID;

if (!clientEmail || !privateKey || !sheetId) {
    console.error('Missing credentials in .env.local');
    console.log('Email:', clientEmail);
    console.log('Key:', privateKey ? 'FOUND' : 'MISSING');
    console.log('SheetID:', sheetId);
    process.exit(1);
}

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

async function setupFormatting() {
    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: clientEmail,
            private_key: privateKey,
        },
        scopes: SCOPES,
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // 1. Get Sheet ID for 'Orders'
    const metadata = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
    const sheet = metadata.data.sheets.find(s => s.properties.title === 'Orders');

    if (!sheet) {
        console.error("Sheet tab 'Orders' not found. Please rename the tab to 'Orders'.");
        return;
    }

    const gridId = sheet.properties.sheetId;
    console.log(`Found 'Orders' tab with Grid ID: ${gridId}`);

    // 2. Add Conditional Formatting Rule
    // Formula: =$F2=FALSE (Boolean check for Checkbox)
    // We insert at index 0 to ensure it takes priority.
    await sheets.spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: {
            requests: [
                {
                    addConditionalFormatRule: {
                        rule: {
                            ranges: [{
                                sheetId: gridId,
                                startRowIndex: 1, // Skip Header
                                endRowIndex: 1000,
                                startColumnIndex: 0,
                                endColumnIndex: 6 // A to F
                            }],
                            booleanRule: {
                                condition: {
                                    type: 'CUSTOM_FORMULA',
                                    values: [{ userEnteredValue: '=$F2=FALSE' }]
                                },
                                format: {
                                    backgroundColor: {
                                        red: 1.0,
                                        green: 1.0,
                                        blue: 0.8 // Light Yellow
                                    }
                                }
                            }
                        },
                        index: 0
                    }
                }
            ]
        }
    });

    console.log('Successfully applied Yellow Background rule (Boolean Safe)!');
}

setupFormatting().catch(console.error);
