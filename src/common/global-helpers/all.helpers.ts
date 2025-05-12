import * as fs from 'fs';
import * as path from 'path';
import { randomBytes, createCipheriv, createDecipheriv, scrypt } from 'crypto';
import moment from 'moment-timezone';
import { DEFAULT_SORT_BY } from '@common/constants/global.constants';
import { Op, where } from 'sequelize';
import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { FileValidationRules } from '@common/global-interfaces';
const algorithm = 'aes-256-cbc'; // AES algorithm with 256-bit key in CBC mode
const key = randomBytes(32); // Generate a random 256-bit key
const iv = randomBytes(16); // Generate a random 128-bit initialization vector (IV)

const hash = (password) => {
  return new Promise((resolve, reject) => {
    const salt = randomBytes(8).toString('hex');

    scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(salt + ':' + derivedKey.toString('hex'));
    });
  });
};

const verify = (password, hash) => {
  return new Promise((resolve, reject) => {
    const [salt, key] = hash.split(':');
    scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(key == derivedKey.toString('hex'));
    });
  });
};

export const AuthHelpers = {
  hash,
  verify,
};

export const encrypt = (data) => {
  const cipher = createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(JSON.stringify(data), 'utf8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  // return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
  return encrypted.toString('hex');
};

export const decrypt = (encryptedData: string) => {
  const decipher = createDecipheriv(
    algorithm,
    key,
    Buffer.from(iv.toString('hex'), 'hex')
  );
  let decrypted = decipher.update(Buffer.from(encryptedData, 'hex'));
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return JSON.parse(decrypted.toString());
};

export const isJSON = (text: string) => {
  try {
    JSON.parse(text);
    return true;
  } catch (e) {
    return false;
  }
};

export const formatDateOnly = (
  date: string | Date,
  type?: string | null | undefined,
  iso?: boolean
) => {
  if (!date) date = new Date(); // If date is not provided, default to current date
  if (iso) return moment(date).tz('Europe/London').toISOString(); // Convert date to ISO format
  const formattedDate = moment(date)
    .tz('Europe/London')
    .format(type || 'DD MMM, YYYY');

  return formattedDate;
};

export const formatDate = (
  date?: string | Date,
  type?: string,
  iso?: boolean
) => {
  if (!date) date = new Date();
  if (iso) return moment(date).tz('Europe/London').toISOString(); // Convert date to ISO format
  const formattedDate = moment(date)
    .tz('Europe/London')
    .format(type || 'DD/MM/YYYY hh:mm:ss a');
    
  return formattedDate;
};

export const getDiffMinute = (otpTime: string) => {
  const currentTime = moment(new Date());
  const startTime = moment(otpTime);
  return currentTime.diff(startTime, 'minutes');
};

export function parseParagraph(paragraph) {
  // console.log('paragraph ', paragraph);

  // Updated regex to handle newlines, spaces, and multiple line breaks between sections
  const regex =
    /\*\*([^\*]+?)\*\*\s*([\s\S]*?)\s*(\*\*Control\*\*|Control)\s*[:]\s*(.*)/;

  const match = paragraph.match(regex);

  if (match) {
    // Capture and trim the title (removing unwanted characters at the start and end)
    let title = match[1].trim();
    title = title.replace(/^[*.: _-]+|[*.: _-]+$/g, '').trim();

    // Capture the description and trim extra spaces or unwanted characters
    let description = match[2].trim();
    description = description.replace(/^[*.: _-]+|[*.: _-]+$/g, '').trim();

    // Capture the control part and trim extra spaces or unwanted characters
    let control = match[4].trim();
    control = control.replace(/^[*.: _-]+|[*.: _-]+$/g, '').trim();

    // Debug logs to check intermediate results
    // console.log('Title:', title);
    // console.log('Description:', description);
    // console.log('Control:', control);

    // Return the final object
    return {
      title: title,
      description: description,
      control: control,
    };
  } else {
    // If no match is found, log the error and return null
    console.log('No match found for paragraph:', paragraph);
    return null;
  }
}

export const sortByOrder = (sortBy?: string) => {
  if (sortBy) {
    const tempValue = sortBy.split('_');
    const sortOrder = tempValue.pop();
    const sortField = tempValue.join('_');
    return [sortField, sortOrder];
  } else {
    return [DEFAULT_SORT_BY, 'asc'];
  }
};

export const searchingAllFields = (
  searchFields: string[],
  searchString: string,
  optionalField: any[] = []
) => {
  const OR = Op.or;
  const LIKE = Op.iLike;
  const whereCond: any[] = searchFields.map((field) => ({
    [field]: {
      [LIKE]: `%${searchString}%`,
    },
  }));
  if (optionalField.length) {
    optionalField.forEach((item) => {
      whereCond.push(
        where(item, {
          [LIKE]: `%${searchString}%`,
        })
      );
    });
  }
  return {
    [OR]: whereCond,
  };
};
export const dateDiff = (date1, date2, type) => {
  date1 = moment(date1 || new Date());
  date2 = moment(date2 || new Date());
  return date1.diff(date2, type);
};

export const storage = diskStorage({
  destination: 'public/uploads',
  filename: (req, file, callback) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    callback(
      null,
      file.fieldname + '-' + uniqueSuffix + extname(file.originalname)
    );
  },
});

export const imageFileFilter = (req, file, callback) => {
  if (file.mimetype === 'image/svg+xml') {
    return callback(
      new BadRequestException('SVG files are not allowed'),
      false
    );
  }

  if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
    return callback(
      new BadRequestException('Only image files are allowed!'),
      false
    );
  }
  callback(null, true);
};
export function generateOTP(): string {
  const characters = '0123456789';
  let OTP = '';
  const length = 6;

  for (let i = 0; i < length; i++) {
    const index = Math.floor(Math.random() * characters.length);
    OTP += characters[index];
  }

  return OTP;
}

export function generateRandomPassword(): string {
  const upperCaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowerCaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const numericChars = '0123456789';
  const specialChars = '!@#$%&()?';

  // Ensure the password meets the requirements
  const upper =
    upperCaseChars[Math.floor(Math.random() * upperCaseChars.length)];
  const lower =
    lowerCaseChars[Math.floor(Math.random() * lowerCaseChars.length)];
  const number = numericChars[Math.floor(Math.random() * numericChars.length)];
  const special = specialChars[Math.floor(Math.random() * specialChars.length)];

  // Randomly select the remaining characters to fill the password to at least 8 characters
  const allChars =
    upperCaseChars + lowerCaseChars + numericChars + specialChars;
  const remainingLength = 4; // 1 character from each category already added

  let remainingChars = '';
  for (let i = 0; i < remainingLength; i++) {
    remainingChars += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Combine all parts
  const password = upper + lower + number + special + remainingChars;

  // Shuffle the password to ensure random character positions
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}

export function cleanJsonFromGPTResponse(jsonString: string): object {
  jsonString = jsonString.replace(/\n/g, '');
  // console.log('jsonString', jsonString);

  const regex = /```json([\s\S]*?)```/g;
  const matches = [];
  let match;

  while ((match = regex.exec(jsonString)) !== null) {
    matches.push(match[1].trim());
  }

  // Step 2: Parse the extracted JSON
  const parsedData = matches.map((jsonString) => {
    try {
      const cleanedJson = jsonString
        .replace(/\\n/g, '') // Remove escaped newlines if any
        .replace(/\\t/g, '') // Remove escaped tabs if any
        .replace(/\\'/g, "'"); // Handle any escaped single quotes
      return JSON.parse(cleanedJson);
    } catch (e) {
      console.error('Invalid JSON:', e);
      return null;
    }
  });

  if (!parsedData) return null;
  // console.log('parsedData', parsedData);
  return parsedData?.[0];
}

export function validateEmail(email: string) {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email); // Returns true if the email matches the regex, otherwise false
}

export function validateMobileNumber(number) {
  const regex = /^\d{7,13}$/;
  return regex.test(number); // Returns true if the number matches the regex, otherwise false
}

export function validateCountryCodeAndDialCode(
  code: string,
  dial_code: string
) {
  // Load the country.json file
  const countryData = JSON.parse(
    fs.readFileSync(
      path.resolve(__dirname, '../../../src/countries.json'),
      'utf-8'
    )
  );

  // Check if the code and dial_code exist in the country data
  const isValid = countryData.some(
    (country: any) => country.code === code && country.dial_code === dial_code
  );

  // If no match found, throw an error
  if (!isValid) {
    throw new BadRequestException('Invalid country code or dial code.');
  }
}

export async function validateFile(
  files: Record<string, Express.Multer.File | Express.Multer.File[]>,
  validationRules: Record<string, FileValidationRules>
) {
  for (const key in validationRules) {
    const rule = validationRules[key];
    const fileOrFiles = files[key];

    // If no file is provided and it is required, throw error
    if (!fileOrFiles && rule.required) {
      throw new BadRequestException(`File for '${key}' is required.`);
    }

    // If a file is provided, process the file(s)
    if (fileOrFiles) {
      // Handle single file (if not an array)
      const filesArray = Array.isArray(fileOrFiles)
        ? fileOrFiles
        : [fileOrFiles];

      filesArray.forEach((file) => {
        // Validate file size and convert size to bytes
        if (rule.maxSize && file.size > rule.maxSize * 1024 * 1024) {
          throw new BadRequestException(
            `File '${key}' exceeds the allowed size of ${rule.maxSize} MB.`
          );
        }

        // Validate file mime type
        if (rule.allowedTypes && !rule.allowedTypes.includes(file.mimetype)) {
          throw new BadRequestException(
            `File '${key}' has an invalid type. Allowed types are: ${rule.allowedTypes.join(', ')}`
          );
        }
      });
    }
  }
}
