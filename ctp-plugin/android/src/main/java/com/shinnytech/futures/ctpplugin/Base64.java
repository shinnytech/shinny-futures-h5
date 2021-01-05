package com.shinnytech.futures.ctpplugin;


import java.io.ByteArrayOutputStream;
import java.nio.charset.Charset;

public class Base64 {
    public static String encode(byte[] data) {
        char[] tbl = {
                'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
                'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f',
                'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
                'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '/'};

        StringBuilder buffer = new StringBuilder();
        int pad = 0;
        for (int i = 0; i < data.length; i += 3) {

            int b = ((data[i] & 0xFF) << 16) & 0xFFFFFF;
            if (i + 1 < data.length) {
                b |= (data[i + 1] & 0xFF) << 8;
            } else {
                pad++;
            }
            if (i + 2 < data.length) {
                b |= (data[i + 2] & 0xFF);
            } else {
                pad++;
            }

            for (int j = 0; j < 4 - pad; j++) {
                int c = (b & 0xFC0000) >> 18;
                buffer.append(tbl[c]);
                b <<= 6;
            }
        }
        for (int j = 0; j < pad; j++) {
            buffer.append("=");
        }

        return buffer.toString();
    }
}

