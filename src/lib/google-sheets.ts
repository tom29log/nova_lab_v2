'use server';

import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

export async function prependRow(range: string, values: string[]) {
    const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const sheetId = process.env.GOOGLE_SHEETS_ID;

    if (!clientEmail || !privateKey || !sheetId) {
        console.error('Google Sheets credentials missing');
        return { success: false, error: 'Credentials missing' };
    }

    try {
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: clientEmail,
                private_key: privateKey,
            },
            scopes: SCOPES,
        });

        const sheets = google.sheets({ version: 'v4', auth });

        // 1. Get Sheet ID from Tab Name (e.g. 'Orders')
        const sheetName = range.split('!')[0];
        const metadata = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
        const sheet = metadata.data.sheets?.find(s => s.properties?.title === sheetName);
        const gridId = sheet?.properties?.sheetId;

        if (gridId === undefined) {
            throw new Error(`Sheet tab '${sheetName}' not found`);
        }

        // 2. Insert 1 empty row at Index 1 (Row 2 visually, below header)
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: sheetId,
            requestBody: {
                requests: [{
                    insertDimension: {
                        range: {
                            sheetId: gridId,
                            dimension: 'ROWS',
                            startIndex: 1,
                            endIndex: 2,
                        },
                        inheritFromBefore: false, // Don't verify/copy formatting from header
                    },
                }],
            },
        });

        // 3. Write data to the new row (Order: A2 start)
        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: `${sheetName}!A2`,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [values],
            },
        });

        return { success: true };
    } catch (error) {
        console.error('Google Sheets API Error:', error);
        return { success: false, error: String(error) };
    }
}

export async function readSheet(range: string) {
    const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\\n');
    const sheetId = process.env.GOOGLE_SHEETS_ID;

    if (!clientEmail || !privateKey || !sheetId) {
        console.error('Google Sheets credentials missing');
        return [];
    }

    try {
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: clientEmail,
                private_key: privateKey,
            },
            scopes: SCOPES,
        });

        const sheets = google.sheets({ version: 'v4', auth });

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: range,
        });

        return response.data.values || [];
    } catch (error) {
        console.error('Error reading from Google Sheets:', error);
        return [];
    }
}
