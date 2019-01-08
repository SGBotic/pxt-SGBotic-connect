//% color=#f47820 icon="\uf121" weight="100"
namespace SGBotic {

    let i2caddr: number
    let mosfetPowerValue: number
    
    export enum OnOffEnum{
    
        //%block="On"
        On = 1,
        //%block="Off"
        Off = 0
    }
    
    export enum YesNoEnum{
    
        //%block="Yes"
        Yes = 1,
        //%block="No"
        No = 0
    }
    
    let _displaybuffer = pins.createBuffer(512);
    let _buf3 = pins.createBuffer(3);
    let _buf4 = pins.createBuffer(4);
    
  //  function cmd(c: number) {
   //     pins.i2cWriteNumber(i2caddr, c, NumberFormat.UInt16BE);
   // }
    
    function cmd1(d: number) {
        let n = d % 256;
        pins.i2cWriteNumber(i2caddr, n, NumberFormat.UInt16BE);
    }

    function cmd2(d1: number, d2: number) {
        
        
        _buf3[0] = 0;
        _buf3[1] = d1;
        _buf3[2] = d2;
        pins.i2cWriteBuffer(i2caddr, _buf3);
    }

    function cmd3(d1: number, d2: number, d3: number) {
        
    
        _buf4[0] = 0;
        _buf4[1] = d1;
        _buf4[2] = d2;
        _buf4[3] = d3;
        pins.i2cWriteBuffer(i2caddr, _buf4);
    }
    
    
    
    /**
     * Initialize oled display
     */
    //% subcategory=ubit-Connect
    //% weight=100 blockGap=8
    //% blockId=oled96_init_display
    //% block="initialize display"
    export function initDisplay(): void {
        i2caddr = 0x3c
       cmd1(0xAE)       // SSD1306_DISPLAYOFF
        cmd1(0xA4)       // SSD1306_DISPLAYALLON_RESUME
        cmd2(0xD5, 0xF0) // SSD1306_SETDISPLAYCLOCKDIV
        cmd2(0xA8, 0x3F) // SSD1306_SETMULTIPLEX
        cmd2(0xD3, 0x00) // SSD1306_SETDISPLAYOFFSET
        cmd1(0 | 0x0)    // line #SSD1306_SETSTARTLINE
        cmd2(0x8D, 0x14) // SSD1306_CHARGEPUMP
        cmd2(0x20, 0x00) // SSD1306_MEMORYMODE
        cmd3(0x21, 0, 127) // SSD1306_COLUMNADDR
        cmd3(0x22, 0, 63)  // SSD1306_PAGEADDR
        cmd1(0xa0 | 0x1) // SSD1306_SEGREMAP
        cmd1(0xc8)       // SSD1306_COMSCANDEC
        cmd2(0xDA, 0x12) // SSD1306_SETCOMPINS
        cmd2(0x81, 0xCF) // SSD1306_SETCONTRAST
        cmd2(0xd9, 0xF1) // SSD1306_SETPRECHARGE
        cmd2(0xDB, 0x40) // SSD1306_SETVCOMDETECT
        cmd1(0xA6)       // SSD1306_NORMALDISPLAY
        cmd2(0xD6, 1)    // zoom on
        cmd1(0xAF)       // SSD1306_DISPLAYON
        clearDisplay();
    }

    /**
     * Clears the whole display.
     */
    //% subcategory=ubit-Connect
    //% weight=95 blockGap=8
    //% blockId=oled96_clear_display
    //% block="clear display"
    export function clearDisplay() {
        cmd1(0xAE);   //display off
      //  for (let j = 0; j < 8; j++) {
      //      setTextXY(j, 0);
           
      //          for (let i = 0; i < 16; i++)  //clear all columns
      //          {
      //              putChar(' ');
      //          }
          
      //  }
       
       setTextXY(0, 0);
       _displaybuffer.fill(0)
       _displaybuffer[0] = 0x40
       pins.i2cWriteBuffer(i2caddr, _displaybuffer)
      
        cmd1(0xAF); //DISPLAY_ON
        setTextXY(0, 0);
    }

   

    /**
     * Move the cursor to new position.
     */
     //% subcategory=ubit-Connect
    //% weight=85 blockExternalInputs=true blockGap=8
    //% blockId=oled96_set_text
    //% row.min=0 row.max=3
     //% column.min=0 column.max=15
    //% block="move cursor to row %row| column %column"
    export function setTextXY(row: number, column: number) {
        let r = row;
        let c = column;

        //cmd(0xB0 + r);            //set page address
        //cmd(0x00 + (8 * c & 0x0F));  //set column lower address
        //cmd(0x10 + ((8 * c >> 4) & 0x0F));   //set column higher address
        cmd1(0xb0 | r) // page number
        cmd1(0x00 | (c % 16)) // lower start column address
        cmd1(0x10 | (c >> 4)) // upper start column address   
    }

    /**
     * Writes a single character to the display.
     */
     /*
    function putChar(c: string) {
        let c1 = c.charCodeAt(0);
        if (c1 < 32 || c1 > 127) //Ignore non-printable ASCII characters. This can be modified for multilingual font.
        {
            writeCustomChar("\x00\xFF\x81\x81\x81\xFF\x00\x00");
        } else {
            writeCustomChar(basicFont[c1 - 32]);
        }
    }
    */
    /*
       
    function writeCustomChar(c: string) {
        for (let i = 0; i < 8; i++) {
            //writeData(c.charCodeAt(i));
            let b = c.charCodeAt(i)
            pins.i2cWriteNumber(0x3c, 0x4000 + b, NumberFormat.UInt16BE);
        }
    }


*/


    /**
     * Writes a string to the display at the current cursor position.
     */
     //% subcategory=ubit-Connect
    //% weight=81 blockGap=8
    //% blockId=oled96_write_string
    //% block="write text %s"
    export function writeString(s: string) {
        let c1 = 0
        let f: string
        let b: number
        let count = 1
        let _buffer = pins.createBuffer(s.length * 8);
        
        //for (let c of s) {
        //    putChar(c);
        //}
        
        for(let n=0; n<s.length; n++){
            c1 = s.charCodeAt(n);
            f = basicFont[c1 - 32]    
            for (let i = 0; i < 8; i++) {
                b = f.charCodeAt(i)
                _buffer[count] = b
                count = count + 1;
                
            }
        }
        _buffer[0] = 0x40
        pins.i2cWriteBuffer(i2caddr, _buffer)
    }


    /**
     * Writes number to the display.
     */
     //% subcategory=ubit-Connect
    //% weight=80 blockGap=8
    //% blockId=oled96_write_number
    //% block="write number %n"
    export function writeNumber(n: number) {
    
        let s:string
        s=n.toString()
        writeString(s)
    }
    
    /*
    function writeData(n: number) {
    
        let b = n;
       // if (n < 0) { n = 0 }
        //if (n > 255) { n = 255 }

        pins.i2cWriteNumber(0x3c, 0x4000 + b, NumberFormat.UInt16BE);
    }
    */
 
    /**
     * set the display to normal or inverse.
     */
     //% subcategory=ubit-Connect
    //% weight=75 blockGap=8
    //% blockId=oled96_inverse_display
    //% block="inverse display %inverse"
    export function inverseDisplay(inverse: YesNoEnum) {
    
        let pInverse: number
        pInverse = inverse
        if(pInverse === YesNoEnum.Yes)
        {
           cmd1(0xA7); //INVERT_DISPLAY
      
        }else
        {
           cmd1(0xA6); //NORMAL_DISPLAY
        }
    }
    
    

    /**
     * Set display contrast.
     */
     //% subcategory=ubit-Connect
    //% weight=60 blockGap=8
    //% blockId=oled96_set_contrast
    //% block="set display contrast %contrast"
    //% contrast.min=0 contrast.max=255
    export function setDisplayContrast(contrast: number) {
        let b = contrast
       // if (b < 0) {
       //     b = 0;
        //}
       // if (b > 255) {
       //     b = 255;
       // }
        cmd1(0x81);
        cmd1(b);
    }

    
     /**
     * Turns the display on off.
     */
     //% subcategory=ubit-Connect
    //% weight=55 blockGap=16
    //% blockId=oled96_on_off_display
    //% block="display %displayStat"
    export function displayOnOff(displayStat: OnOffEnum) {
        let pDisplayStat: number
        pDisplayStat = displayStat
        if(pDisplayStat === OnOffEnum.On)
        {
           cmd1(0xAF); //DISPLAY_ON
      
        }else
        {
            cmd1(0xAE); //DISPLAY_OFF
        }
    }
    
   /**
    * Set MOSFET driver output
    */
    //% subcategory=ubit-Connect
    //% blockId="ubitConnect_setMosfetPower" block="MOSFET driver output %mosfetPower"
    //% weight=40 blockGap=8
    //% mosfetPower.min=0 mosfetPower.max=100
    export function setMosfetPower(mosfetPower: number) {
        mosfetPowerValue = mosfetPower
        mosfetPowerValue = (mosfetPowerValue * 1023) / 100
        pins.analogWritePin(AnalogPin.P16, mosfetPowerValue)
    }   
    
    
}

//const DISPLAY_OFF = 0xAE;
//const DISPLAY_ON = 0xAF;
//const SET_DISPLAY_CLOCK_DIV = 0xD5;
//const SET_MULTIPLEX = 0xA8;
//const SET_DISPLAY_OFFSET = 0xD3;
//const SET_START_LINE = 0x00;
//const CHARGE_PUMP = 0x8D;
//const EXTERNAL_VCC = false;
//const MEMORY_MODE = 0x20;
//const SEG_REMAP = 0xA1; // using 0xA0 will flip screen
//const COM_SCAN_DEC = 0xC8;
//const COM_SCAN_INC = 0xC0;
//const SET_COM_PINS = 0xDA;
//const SET_CONTRAST = 0x81;
//const SET_PRECHARGE = 0xd9;
//const SET_VCOM_DETECT = 0xDB;
//const DISPLAY_ALL_ON_RESUME = 0xA4;
//const NORMAL_DISPLAY = 0xA6;
//const COLUMN_ADDR = 0x21;
//const PAGE_ADDR = 0x22;
//const INVERT_DISPLAY = 0xA7;
//const ACTIVATE_SCROLL = 0x2F;
//const DEACTIVATE_SCROLL = 0x2E;
//const SET_VERTICAL_SCROLL_AREA = 0xA3;
//const RIGHT_HORIZONTAL_SCROLL = 0x26;
//const LEFT_HORIZONTAL_SCROLL = 0x27;
//const VERTICAL_AND_RIGHT_HORIZONTAL_SCROLL = 0x29;
//const VERTICAL_AND_LEFT_HORIZONTAL_SCROLL = 0x2A;

const basicFont: string[] = [
    "\x00\x00\x00\x00\x00\x00\x00\x00", // " "
    "\x00\x00\x5F\x00\x00\x00\x00\x00", // "!"
    "\x00\x00\x07\x00\x07\x00\x00\x00", // """
    "\x00\x14\x7F\x14\x7F\x14\x00\x00", // "#"
    "\x00\x24\x2A\x7F\x2A\x12\x00\x00", // "$"
    "\x00\x23\x13\x08\x64\x62\x00\x00", // "%"
    "\x00\x36\x49\x55\x22\x50\x00\x00", // "&"
    "\x00\x00\x05\x03\x00\x00\x00\x00", // "'"
    "\x00\x1C\x22\x41\x00\x00\x00\x00", // "("
    "\x00\x41\x22\x1C\x00\x00\x00\x00", // ")"
    "\x00\x08\x2A\x1C\x2A\x08\x00\x00", // "*"
    "\x00\x08\x08\x3E\x08\x08\x00\x00", // "+"
    "\x00\xA0\x60\x00\x00\x00\x00\x00", // ","
    "\x00\x08\x08\x08\x08\x08\x00\x00", // "-"
    "\x00\x60\x60\x00\x00\x00\x00\x00", // "."
    "\x00\x20\x10\x08\x04\x02\x00\x00", // "/"
    "\x00\x3E\x51\x49\x45\x3E\x00\x00", // "0"
    "\x00\x00\x42\x7F\x40\x00\x00\x00", // "1"
    "\x00\x62\x51\x49\x49\x46\x00\x00", // "2"
    "\x00\x22\x41\x49\x49\x36\x00\x00", // "3"
    "\x00\x18\x14\x12\x7F\x10\x00\x00", // "4"
    "\x00\x27\x45\x45\x45\x39\x00\x00", // "5"
    "\x00\x3C\x4A\x49\x49\x30\x00\x00", // "6"
    "\x00\x01\x71\x09\x05\x03\x00\x00", // "7"
    "\x00\x36\x49\x49\x49\x36\x00\x00", // "8"
    "\x00\x06\x49\x49\x29\x1E\x00\x00", // "9"
    "\x00\x00\x36\x36\x00\x00\x00\x00", // ":"
    "\x00\x00\xAC\x6C\x00\x00\x00\x00", // ";"
    "\x00\x08\x14\x22\x41\x00\x00\x00", // "<"
    "\x00\x14\x14\x14\x14\x14\x00\x00", // "="
    "\x00\x41\x22\x14\x08\x00\x00\x00", // ">"
    "\x00\x02\x01\x51\x09\x06\x00\x00", // "?"
    "\x00\x32\x49\x79\x41\x3E\x00\x00", // "@"
    "\x00\x7E\x09\x09\x09\x7E\x00\x00", // "A"
    "\x00\x7F\x49\x49\x49\x36\x00\x00", // "B"
    "\x00\x3E\x41\x41\x41\x22\x00\x00", // "C"
    "\x00\x7F\x41\x41\x22\x1C\x00\x00", // "D"
    "\x00\x7F\x49\x49\x49\x41\x00\x00", // "E"
    "\x00\x7F\x09\x09\x09\x01\x00\x00", // "F"
    "\x00\x3E\x41\x41\x51\x72\x00\x00", // "G"
    "\x00\x7F\x08\x08\x08\x7F\x00\x00", // "H"
    "\x00\x41\x7F\x41\x00\x00\x00\x00", // "I"
    "\x00\x20\x40\x41\x3F\x01\x00\x00", // "J"
    "\x00\x7F\x08\x14\x22\x41\x00\x00", // "K"
    "\x00\x7F\x40\x40\x40\x40\x00\x00", // "L"
    "\x00\x7F\x02\x0C\x02\x7F\x00\x00", // "M"
    "\x00\x7F\x04\x08\x10\x7F\x00\x00", // "N"
    "\x00\x3E\x41\x41\x41\x3E\x00\x00", // "O"
    "\x00\x7F\x09\x09\x09\x06\x00\x00", // "P"
    "\x00\x3E\x41\x51\x21\x5E\x00\x00", // "Q"
    "\x00\x7F\x09\x19\x29\x46\x00\x00", // "R"
    "\x00\x26\x49\x49\x49\x32\x00\x00", // "S"
    "\x00\x01\x01\x7F\x01\x01\x00\x00", // "T"
    "\x00\x3F\x40\x40\x40\x3F\x00\x00", // "U"
    "\x00\x1F\x20\x40\x20\x1F\x00\x00", // "V"
    "\x00\x3F\x40\x38\x40\x3F\x00\x00", // "W"
    "\x00\x63\x14\x08\x14\x63\x00\x00", // "X"
    "\x00\x03\x04\x78\x04\x03\x00\x00", // "Y"
    "\x00\x61\x51\x49\x45\x43\x00\x00", // "Z"
    "\x00\x7F\x41\x41\x00\x00\x00\x00", // """
    "\x00\x02\x04\x08\x10\x20\x00\x00", // "\"
    "\x00\x41\x41\x7F\x00\x00\x00\x00", // """
    "\x00\x04\x02\x01\x02\x04\x00\x00", // "^"
    "\x00\x80\x80\x80\x80\x80\x00\x00", // "_"
    "\x00\x01\x02\x04\x00\x00\x00\x00", // "`"
    "\x00\x20\x54\x54\x54\x78\x00\x00", // "a"
    "\x00\x7F\x48\x44\x44\x38\x00\x00", // "b"
    "\x00\x38\x44\x44\x28\x00\x00\x00", // "c"
    "\x00\x38\x44\x44\x48\x7F\x00\x00", // "d"
    "\x00\x38\x54\x54\x54\x18\x00\x00", // "e"
    "\x00\x08\x7E\x09\x02\x00\x00\x00", // "f"
    "\x00\x18\xA4\xA4\xA4\x7C\x00\x00", // "g"
    "\x00\x7F\x08\x04\x04\x78\x00\x00", // "h"
    "\x00\x00\x7D\x00\x00\x00\x00\x00", // "i"
    "\x00\x80\x84\x7D\x00\x00\x00\x00", // "j"
    "\x00\x7F\x10\x28\x44\x00\x00\x00", // "k"
    "\x00\x41\x7F\x40\x00\x00\x00\x00", // "l"
    "\x00\x7C\x04\x18\x04\x78\x00\x00", // "m"
    "\x00\x7C\x08\x04\x7C\x00\x00\x00", // "n"
    "\x00\x38\x44\x44\x38\x00\x00\x00", // "o"
    "\x00\xFC\x24\x24\x18\x00\x00\x00", // "p"
    "\x00\x18\x24\x24\xFC\x00\x00\x00", // "q"
    "\x00\x00\x7C\x08\x04\x00\x00\x00", // "r"
    "\x00\x48\x54\x54\x24\x00\x00\x00", // "s"
    "\x00\x04\x7F\x44\x00\x00\x00\x00", // "t"
    "\x00\x3C\x40\x40\x7C\x00\x00\x00", // "u"
    "\x00\x1C\x20\x40\x20\x1C\x00\x00", // "v"
    "\x00\x3C\x40\x30\x40\x3C\x00\x00", // "w"
    "\x00\x44\x28\x10\x28\x44\x00\x00", // "x"
    "\x00\x1C\xA0\xA0\x7C\x00\x00\x00", // "y"
    "\x00\x44\x64\x54\x4C\x44\x00\x00", // "z"
    "\x00\x08\x36\x41\x00\x00\x00\x00", // "{"
    "\x00\x00\x7F\x00\x00\x00\x00\x00", // "|"
    "\x00\x41\x36\x08\x00\x00\x00\x00", // "}"
    "\x00\x02\x01\x01\x02\x01\x00\x00" // "~"
];
