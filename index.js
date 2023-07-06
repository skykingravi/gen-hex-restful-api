import express from "express";
import cors from "cors";
import dotenv from "dotenv";

const app = express();

app.use(express.json());
dotenv.config();
app.use(cors());

const PORT = process.env.PORT || 8080;
const SECRET = process.env.SECRET;

function hexToHSL(hexCode) {
    const trimedHexCode = hexCode.replace("#", "");

    const red = parseInt(trimedHexCode.substring(0, 2), 16);
    const green = parseInt(trimedHexCode.substring(2, 4), 16);
    const blue = parseInt(trimedHexCode.substring(4, 6), 16);

    const r = red / 255;
    const g = green / 255;
    const b = blue / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    let hue, delta;
    if (max === min) {
        hue = 0;
    } else {
        delta = max - min;
        let h;

        if (max === r) {
            h = ((g - b) / delta) % 6;
        } else if (max === g) {
            h = (b - r) / delta + 2;
        } else {
            h = (r - g) / delta + 4;
        }

        hue = Math.round(h * 60);
        if (hue < 0) {
            hue += 360;
        }
    }

    let lightness = (max + min) / 2;

    let saturation;
    if (max === min) {
        saturation = 0;
    } else if (lightness <= 0.5) {
        saturation = delta / (max + min);
    } else {
        saturation = delta / (2 - max - min);
    }

    hue = Math.round(hue);
    saturation = Math.round(saturation * 100);
    lightness = Math.round(lightness * 100);

    return {
        hue,
        saturation,
        lightness,
    };
}

const getRGBPercentage = (hexCode) => {
    hexCode = hexCode.toLowerCase();
    const trimedHexCode = hexCode.replace("#", "");

    const redValue = parseInt(trimedHexCode.substring(0, 2), 16);
    const greenValue = parseInt(trimedHexCode.substring(2, 4), 16);
    const blueValue = parseInt(trimedHexCode.substring(4, 6), 16);

    return {
        red: Math.round((redValue/255)*100),
        green: Math.round((greenValue/255)*100),
        blue: Math.round((blueValue/255)*100)
    }
}

function isColorDarkOrLight(hexCode) {
    hexCode = hexCode.toLowerCase();

    hexCode = hexCode.substring(1);

    const r = parseInt(hexCode.substring(0, 2), 16);
    const g = parseInt(hexCode.substring(2, 4), 16);
    const b = parseInt(hexCode.substring(4, 6), 16);

    return getLuminance(r, g, b);
}

function getLuminance(r, g, b) {
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? "Light" : "Dark";
}

const genrateColorCode = () => {
    return `#${Math.floor(Math.random() * 0x1000000)
        .toString(16)
        .padStart(6, "0")}`;
};

app.get("/:secret", (req, res) => {
    const { secret } = req.params;
    if (secret !== SECRET) {
        res.json({
            message: "You are not Authorized!",
        });
    } else {
        const newColor = genrateColorCode();
        const hslValue = hexToHSL(newColor);
        res.json({
            colorCode: newColor,
            colorTheme: isColorDarkOrLight(newColor),
            hue: hslValue.hue,
            saturation: hslValue.saturation,
            luminance: hslValue.luminance,
            rgbPercentage: getRGBPercentage(newColor)
        });
    }
});

app.listen(PORT, () => {
    console.log(`SERVER STARTED AT PORT - ${PORT}`);
});
