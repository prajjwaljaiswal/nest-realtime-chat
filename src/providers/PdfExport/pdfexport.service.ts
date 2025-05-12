import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';

const LOGO =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAARkAAADlCAYAAABnN4PBAAAXRklEQVR4nO3dT28cx5kG8OetFkU7QOIOKSFILhlukgVyUnFonz36BFaOXi9g8hNIOu1q90DyEBDei6RPQAqON0fJn4DUzYCpYfvk3XUCjoDFQoBFZQwsFrLAqXcPM2OTEsmpmun//fyABDYwmmn1eJ6u6n7rLQFRRra++bQjUbQugFUgBtCD6p6+erV55/drvaKPj/IhRR8A1c/GwXb81jvzDwF0znuNqG78028+2szxsKggDBlK1TBgLu8CYie9lkHTDAwZSk1IwIwxaOqPIUOpmCZgxhg09caQoZnNEjBjDJr6YsjQTNIImDEGTT0xZGhqaQbMGIOmfhgyNJUsAmaMQVMvDBkKlmXAjDFo6oMhQ0HyCJgxBk09MGTIW54BM8agqT6GDHkpImDGGDTVxpChiYoMmDEGTXUxZOhCZQiYMQZNNTFk6FxlCpgxBk31MGToTGUMmDEGTbWYog+Aymfr6+1WWQMGAFRk45O/frZe9HGQH45k6JStr7dbMj+/C6BV9LFMwhFNNTBk6AdVCpgxBk35MWQIQDUDZoxBU24MGap0wIwxaMqLIdNwdQiYMQZNOTFkGqxOATPGoCkfhkxD1TFgxhg05cKQaaA6B8wYg6Y8GDIN04SAGWPQlANDpkGaFDBjDJriMWQaookBM8agKRZDpgFGe1MfoIEBM8agKQ4XSDbA2z+bX0eDAwYYLqrc+ubTTtHH0UQMmZq7e7gdq+BW0cdRBhJFXLldAIZMzb3EpVK2ayiG8lwUgCFTdwPT6GnSaRIXfQRNxJCpOQPpF30M5aE8FwVgyNTc5ej7PQH44wKgTr4q+hiaiCFTc7eX1vqq+qDo4ygH3Sn6CJqIIdMA8+bVBoBe0cdRJHV6/85vP2LIFIDFeA2xdfjnlqg2suJXHR7c+e0/rBZ9HE3FkGmQJgYNA6Z4DJmGaVLQMGDKgSHTQE0IGgZMeTBkGqrOQcOAKReGTIPVMWgYMOXDkGm4OgUNA6acGDJUi6BhwJQXQ4YAVDtoGDDlxpChH1QxaBgw5cdlBSW1cbAdb33zaWfjYDu39gR3lj7sqch1VGQJQlEBs3W4XZkQLgOOZEpm42A7fvtn8+snu9nl3Z+2CiOavANm6+vtFubmNowxHygQC9CH6j32DZ6MIVMiwx0FLj8E5IwObpq8/O7V9Y3ltVzaNpQ5aHIPmG8+7ZgoeqjAGaPKfL+XKuJ0qSR+3LLkrIABALFvvTN/sPV1PkP1sk6ddKCbeQbMJ4d/+liiaPfsgAGG38vl3TyntVXDkUwJBO6J1NPvv79+5/drufz4yzSi0YFu3vndRxt5fd4nh3/6WNV4tofgiOY8DJmCTbnpWuOCptwBM8agOQunSwWaYVfHlszP7zZl6pR/wHy2Hh4wwHjqlNf3UhUcyRQkpW1jaz+iKSZgZNbPy/V7KTuGTAFS3pe6tkFT0YAZY9CMMGRyltHG97ULmooHzBiDBgyZXGUUMGO1CZqaBMxY44OGIZOTjANmrPJBU7OAGWt00DBkcpBTwIxVNmhqGjBjjQ0ahkzGcg6YscoFTc0DZqyRQcOQyVBBATNWmaBpSMCMNS5oGDIZKThgxkofNA0LmLFGBQ1DJgMlCZix0gZNQwNmrDFBw2UFKStZwAAFLUEQILnodQ0PGABoyfzlh01Yvc2RTIo2Drbjt96ZP0B5Auak3K+cW3/5bFWM3AJwDQAE6DvgK4hs3Fn6cC+v4yhhwJygyT//3UfLRR9FlhgyKfrkr/9+92RHuxIqbIi+dfjn1p2lD3P/3HIHzJBTd/tffvOP94o+jqxwupQmQdkbWrdkfn73j//12TmNsbLDgDmfMdG1oo8hSwyZ5mlFl1BI0OSpKgEDADpw3xV9DFliyKTIqd4v+hj8SFznoKlSwAAA1Dwq+hCyxJBJ0Vvm1T2UrCfu+eoZNFULGHV6/87v8rsJXgTe+E1ZGVpVhtH+4BjX//XvP7rwkXMVVC9gmrExHUMmAwya/DFgyoshkxEGTX4YMOXGkMkQgyZ7DJjyY8hkjEGTHQZMNTBkcsCgSR8DpjoYMjlh0KSHAVMtDJkcMWhmx4CpHoZMzhg002PAVBNDpgAMmnAMmOpiyBSEQeOPAVNtXLtUkKI3sQ8ncXRJHua9mTwDpvo4kilY9UY0+TW+YsDUA0OmBBg0b2LA1AdDpiQYND9iwNQLQ6ZEGDQMmDpiyJRMk4OGAVNPfLpUMtV76pTOvk6VC5iBbjJg/HAkU1JNGtFUMmBy3Jiu6hgyJVb3oNk42I7f/tn8esn3qjqFAROOIVNyFQwaiOqGe/XqwUVhs/XNpx2Jom1U6O/FgJkOQ6YCKhk0QF9VHzl1n4uiDwAqiAWmI0Y+QIX+LgADZhYMmYqoYtDUBQNmNgyZCmHQ5I8BMzuGTMUwaPLDgEkHQ6aCGDTZY8CkhyFTUQya7DBg0sWQqTAGTfoYMOljyFQcgyY9DJhsMGRqgEEzOwZMdhgyNcGgmZ46vX/ntx9VZmlD1TBkaoRBE47tGrLHkKkZBo0/Bkw+GDI1xKCZjAGTHzatqqEKNr7K1fAeDAMmLwyZmrqz9GFvXr5fVuBB0cdSFgL01ekab/Lmi9OlBtj6y2erYmQdTZ4+iewosHln6UOO7nLGkGmQpoWNAH2n+gDGPLqz9OFe0cfTVAyZBvq3w8/swOEGRDoCxACuFX1MaRCgr8BTVd2DMY++x8tkY2mtX/RxNR1Dhk7ZOvxzaqOcCC4ewMQpvE9/AHNhWHyPl30GChERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERHVgMTWxhFwY8Lr+kdJ8iiXIyopz/OEAbDXT5Je2p8NoAUgBoB+kuyl+f6jz7Dj9y+pPoBeP0n6RR/IeUbfky36OALkck5lYWX5QCATT4wq7r3odm9neTBlttBePhSR1qTXqWrPOV1O44uLre1EkaxDYSFyKgBUseOc20wj0Bba9q6IuTXr++RCta+CHlQSgXs8cEj6SZIUfViLK/YGYB4WfRxTGZ1TgfRU3WM3PKepXchkcaX9N/hdwfqDgVsq85UkK4ttuwox276vH4i53t/fn+lLutK26ypmY9LrVN3Gi26yOctnLa60dZY/XzRV7QHyuXPuXtqjSF+LK8u7gHSK+OwsjM7pnnPuwayBYwD1vQrExpjVWT6sqpzIxGnSCb28AgYARMzGQtuuz/J5VSciLRHcjCJzuLiyvLvYto387zRNo3O6GkVmd6G9fLjYtquxtRNH8mcxIup9FRTRD6b5kCqLrW0ZiPffWxUPZvm8q9Za34AZEzEb8bu2NlfR2UgHYrYX2suHseU5SYOItCBm2xiZKsDN8/1kD8MbQD4f1xnd3GqMyCDoP9TLl93OLJ/nIrk7zZ+LVBo9mnmdiLSGV+H29rRXYDptHDajAPc+pwYIu/oaU5EbhClRkZv+L8bjZ19Mf09g+MVNO69v3gXAhwhWjZHdq+/ZKj31KbVRgB/6TtMNABjjvB9Pi+j70x5c1cTWtnyevJ0w0yjm0vAx9QxvcIk/pDOISMs5c9D0e1dpG94PbE8ceRsAGE6Z1PNmpXSaMv83IiH3RnpH3e5MIaPGzBQykXOcFlyAN8nTJ4JbiyvtC5+8mvE/qMrnvm9snGlEyEAQMmqbva5A3EzlAQNjCnl8WyUMmkysXjSiuTT+B+fcThQZr5uOIrgJIOgJSNVcsbajHsV3Y8a4+7N+5mCAJIpmeIPj46yL0h4B8kBEcq2VUtVYVVsQtERhIbiGGaqTR0Hz3Ytuci/Fw/TVg2JTCr4gqHMtBVoiYgG9hhmn6iK4tdC2T886p3LyX0IKigbirvf30y9vL4uF5eUdMfKx58t7R0+6S2l87tRFXYrHR93uVCNMz2K8/tGT7s+nef8sXHn33Y7qYBXw/o7eYIxb/vbLdKqFfb+3NAo1s3D1vfesc8e3AHkf0wdO3xh3/fVzak7+S0jNjHEmpECtUmJr44CAARQzVdyeFPIdnDQwYbU1oVR9yxzy8Xx/f+/oycHq3JxbEsEmvMswfjQYyMPcn8gdH5dySvvtl18mR08OVo+edJegWAMwzXHGzr1ZgnEqZI6PkcDzyxLBx3V9ZBqZyQshT5q77FK7Mo3qloKmXirYLOPVMQ/Pvkh6z/e7G3NzbhnQoEJIEWkZY3h/5jVH3e7O3Jy7Hno+h6TzesHeqZDpJ0k/oGYmjkxNRzMSMgTXz2epjTnL0ZPurdHVefKnCzZf7HdrfX/Mx7Mvkt7Rk4NV3/M2JoJbTXlaGmLa8wkAitOFoeb1F4TUzEB06vlwWYUXxJmZHluf5/l+dwOKNSgen/kCxWMRc50Bc9rwvLm1kD/DaunzTXM+RaR1MrjfCJngmpmaTZlM2Oisd/TkSWZ9do663Z2jbrczN+eWAPnDcK4sfxj81P38qNvtPG/oFGmSo26yo4qAtiTNqf2axlE32Qkd0ZwM7ktnvUBUHqv4rdkZrcwu4lFgRvTmaw/dLpLLj3w0HSvlDcOyetHt3ltcabcAeC0LidTcRE7fZxU93+9uLK4sv+8/yhcbWxv3k6T/xkgGAI6d8w6NOq3MvmJtx6cx1djcnEvtqRKlbzBwG/AP59qNytM2N6dr8H+KF+PSsEvgmSEzbEwVNGWqRTm7E/Ffxj7jYkjKXj9J+iLe9xMa2y/J17Mvkp6o/5NP48z5ITN6if+b1eXLCVtGkMkNX0pXyD1GEeV9mQlCZjmjyuzzQ2YwGAT0mUHlnzItrtgbIVOlgQt4CkeF8l+XJ43pMDCtkFmOGXUwODdkQmpmRNCq+t15h4CpErDTxF7HVeWcdyOxuC5T/yz5hrZTjYELp0thNTNVXmYQ2mJzIGamFpuUr36S9NWzl3UURezJM4ExzutcigzXQF0YMs/3kz0onnq+YWWnTIEtNmduFE75E+Arn9epKkcyExwfh5VTnFknc5IAOwr4VETG8bu2U8mV2QHLCDTg7vrrQnYhCKXQxA30OqdxZ1OVxPNCyJCZoJ8kvcWVtvfrLxzJAGF3k0cFTZUSuozg8uXpb/hmFTAAIBBb27VkKRDfhxiCdzI+lMZQHY54JoZMWM1M9QqaghqjszaGyJsZNTebGDJAUGvOChY0BVUsszaGGs93IKFwTwHPkBk9AvTsM1OdZQaBywhmbhROxVHfdp2K7zI+lMq7BHg9gVOVBPAMmbA+M9VZmR20jICL56rO92LCG+cTqPE7l86YPcAzZIDAmpkKbAA3arHpPepKo1E4FUdEr/m9TrJuxl553nvDjxrbe4dMyHa2VdgAbtRi03fE1Uur4TQVxW+TvkHOOzFUTWxtbLyWX+jn43IK75ABAP8VmBVoAhTSYjO9RuH8D7gAV6ztwPOCwkLLi3lfnFV+mPlMLMY76Xi4N5Pf/rfDDeBK+YWF1sak1Sh8bs4tv3oV9vRNRFsYLnmoxH2uMnIiq15tyM5rdUo/UMi6x7k89ZAkKGSGlX7Lez4/0DJvABe4jGAnrdqY0fsEn5OFdvuWCLw23qPTYmtbvtvbKMCV9RcYVqx7PI19beQfNF0Cwmpmyjpler2b+sX8t+/NinF+C9LoTSH7mc9SzV13V621nhXrb5R6BIdMSM1MGVdmx9baoNqYDBuFU7YW23bVdxQjkITV3GeLrW0NjDz0ee1wv6bTgkNmtMzAa+5axg3gjEjI4/VS3lOiyWJrWyEjVlVlicIZrlprjZFdnwuzCG6fFdTBITN8M/VdNPlDM+HSCGixyUbh1RRb2/L9YYywmvsMC217y3meRxVsPt/vnpkLU4VMSM1MmTbOCmqxycWQlTRFwKS6l3kdxNZ2FleWd0XMXYhMnIlM2sV0qpABgmpmbFmmTOo8KxWHeGWrmMUVeyMychAUMHmPYi6Vs19NbG08DpcoMru+JR4iuD1pF9OgR9in3jxyj9R51czEZdgALuRRJsBG4VUSW9uKItkGpOO/L9/QWTcqs2RU7sbWhuxflJU4AqwaY0X0GhTWZ9RyQk/ErPnsYjp1yHz7ZZL418zoByg4ZEJrY9hhrvxiaztRZG4CmOop5nk3KrMkEBtFcpDnZ15Exv8fGM4O2hN3bGNr+/3k4iU3U4cMMKyZEa/tbIcrswv94QYsI2Cj8DeJoLXQtrdedJNCLhajKXcrAqxG5n1RvRF45T1FBZtH59yopMkMpAORThQBC+3lnkA3j7rJmdPOmULG/bjMYOKXPVqZXUgFcOAyAjYKP4eIubvYXl5HvkP9+PUwkeHBzPCW+uDF/kEpq9GraHgPTLYX2svrzun1fnJ6dDhTyPSTpL+4spx4/YCHU6ZCvtiQ1hOzNApvhOEPvhQ38qejD46eHFSse2M1iEgriuTg6nv2+smuBVM/XfrxjdXr8Z9AbHHLDPy79bG0vL4UuM+AyVzsnNk9uUnezCETUjNTxDKDoBabrI2pq74Ibr940i19M7WaiIdP+4ZmDhkACNjONvcN4AJbbLI2pm4Uj+fm3PJ51aiUFekstu0qkFLIBLTmzH1ldkCLTZaW10sfirWjbrfD0WlBRk90UwmZ4ZTJb28moya30cwoSX1vUvKJUj30RLA5+Klb4kWjaMMOmTM9XTrJt2ZGgBuxtbdzqZkJqI1ho/BK6yvkcyOy41OBWrCeKu5772hZAgrEImox7O0btCzCOGNTC5lRzYxP97Z4tJ1qpleZ0NoYNgqvEMVTiCQimgBmrwLBcoLcftGtbo+ixXZ7FcMujX4zBMG11EJmVDPjtcwAoh8j45AJWkbAVbh+hj1w85+CiPRFpH986VIPb73s9/equ+RjMBhU+mJ21O3uXH3PJs6ZXXg1FEd60yVgWDOj6jN6yH6ZgYrc9K0JTatReM31j7rdUrZTpXx9+2WSXGm376tg4gJpEcSp3PgdOz5GAt+amQz3zI6tteK5zw5SbBReZ6rVuYdA2Tt2zrtxXaohE7KdbZZ7Zoe12Cy+UThR1fSTpA/FU5/XphoyQEjNjHROlh6nyr/FJhuFE01L9NDnZamHzPP9ZE/ht59wFlOmoGUErI0hylzqIQMARtVrCjLaAC5VIcsI2CicKHuZhEzITaE0lxnE1sbeLTa5GJIoF5mEzGhvJr9lBimuzB5tBu6LJedEOcgkZAAAKt4rs1PbzSCkxSYbhRPlIrOQGf2IfWorUtkALnAZARuFE+Uks5AJqZlJYwO4SwFPqtgonCg/2U2XEFQzM/MGcA7qO1Vio3CiHGUaMs/3kz3PqsB4lpqZkNoYNgonylemIQMA4vkUZ5ZlBiG1MWwUTpSvzEPGv2ZmuDJ7qg/xXUbA2hii3GUeMkE1MwH7I40ttu1qwDIC1sYQ5SzzkAGGrTl9Xieivgsbf+BEfAvw2CicqAC5hIxzbgdeNTPDxsO+7xtb2zLw3o2AT5SICpBLyITUzBhnvEMmpMUmG4UTFSOXkAH8a2ZEcNP3BrDCu4iPjcKJCpJbyARsZxsbYyaGx5W2XQ/YfpYtHYgKklvIAIB4FsKJ4NZCu70d2zfvz8TWdhaWl3dUzIbv57JROFFxUt2tYJLj4d5MXlMcEaxGkVldXGnP+rFsFE5UoFxHMv0k6fnWzKSHjcKJipRryAD+NTMpYaNwooLlHjL+NTOp4L0YooLlHjKjZQaP8/gsNgonKl7uIQMAIurbaHx6XAxJVAqFhMyoZibrAOA6JaISKCRkAEDErWX25orHdVoMeex7D0tk2ntdE/+cwG9L0qZSla88X1qb3tKef+delPmRnOP//udZ751f/+KBG8gyBOlsV6t4Kgb3Bz91t172nr1M5T1L4OWzZ89+8qtf/hyKXwL47sz/CfaOnnSnugf1k1/94j9V5fcCfH/O+381d9mt/u9/P6vNDyRt7/z6F//hHJag8jbO+44i3P5b9+CLIo8zTR5/569M5Nb+HyZMPTdLe98pAAAAAElFTkSuQmCC';

@Injectable()
export class PdfExportService {
  async genratePdfBlob(content: string) {
    try {
      const browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--allow-insecure-localhost',
        ],
      });
      const page = await browser.newPage();
      await page.setContent(content);
      const pdf = await page.pdf({
        format: 'A3',
        printBackground: true, // Include background colors and images
        displayHeaderFooter: true,
        headerTemplate: `
        <style>
        html {
          -webkit-print-color-adjust: exact;
        }
        </style>
        <div id="header-template" 
           style="font-size:10px !important; 
           color:#808080; padding-left:10px;
           width:100%;
           position:relative; height:50px;
           background:#efefef !important;">
            <div style="position: absolute;
            background: white;
            height: 35px;
            width: 70px;
            left: 20px;
            bottom: 0;">
            <span style="color: #efefef;
              font-size: 24px;
              text-align: center;"><p class="pageNumber" style="margin-top: 0px;
              text-align: center;
              font-weight: 1000;
              font-size: 36px;"></p>
              </span>
              </div>
                 <div style="position: absolute;            
            height: 35px;
            width: 70px;
            right: 10px;
            bottom: 10px;">
            <img width="50px" height="40px" src="${LOGO}">
            </div>
            
        </div>`,
        footerTemplate: `
        <style>
        html {
          -webkit-print-color-adjust: exact;
        }
        </style>
        <div id="footer-template" style="width:100%;font-size:10px !important; color:#808080; padding-left:10px;position:relative; height:50px;background-color:#fff !important;"></div>`,
        margin: {
          top: '100px',
          bottom: '200px',
          right: '30px',
          left: '30px',
        },
      });

      await browser.close();
      return pdf;
    } catch (error) {
      console.log(`PDF GENRATE error`, error);
      throw error;
    }
  }
}
