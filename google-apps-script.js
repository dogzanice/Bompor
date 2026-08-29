/**
 * =========================================================================
 * GOOGLE APPS SCRIPT: สำหรับรับไฟล์ Word จากเว็บ Bompor บันทึกดูงาน
 * โฟลเดอร์เป้าหมาย: https://drive.google.com/drive/folders/1NxIYXdZLv8rLU2I-ZYByldW-AAEznFU9
 * =========================================================================
 * 
 * วิธีการติดตั้ง (ทำเพียงครั้งเดียว):
 * 1. เปิดเว็บ https://script.google.com แล้วกด "New project" (โครงการใหม่)
 * 2. ลบโค้ดเดิมทั้งหมด แล้วคัดลอกโค้ดนี้ไปวาง
 * 3. กดปุ่ม "Deploy" (การทำให้ใช้งานได้) -> "New deployment" (การทำให้ใช้งานได้รายการใหม่)
 * 4. เลือกประเภท: "Web app" (เว็บแอป)
 * 5. ตั้งค่า:
 *    - Description: Bompor Upload Endpoint
 *    - Execute as (ดำเนินการในฐานะ): "Me" (ฉัน - บัญชีเจ้าของ Google Drive)
 *    - Who has access (ผู้มีสิทธิ์เข้าถึง): "Anyone" (ทุกคน) *** สำคัญมาก เพื่อให้เด็กทุกคนส่งงานได้ไม่ต้อง Login
 * 6. กด "Deploy" -> ให้สิทธิ์การเข้าถึง Google Drive
 * 7. คัดลอก "Web app URL" ที่ได้ (ขึ้นต้นด้วย https://script.google.com/macros/s/.../exec)
 *    นำไปใส่ในเว็บ Bompor ได้ทันที!
 */

const TARGET_FOLDER_ID = '1NxIYXdZLv8rLU2I-ZYByldW-AAEznFU9';

function doPost(e) {
  try {
    let data;
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e.parameter) {
      data = e.parameter;
    } else {
      throw new Error('ไม่พบข้อมูลที่ส่งมา');
    }

    const fileName = data.fileName || 'แบบบันทึกการศึกษาดูงาน.docx';
    const fileBase64 = data.fileBase64;
    const department = (data.department || 'ไม่ระบุแผนก').trim();
    const studentName = data.studentName || 'ไม่ระบุชื่อ';
    const level = data.level || 'ไม่ระบุชั้น';

    if (!fileBase64) {
      throw new Error('ไม่พบไฟล์เอกสาร (fileBase64 is empty)');
    }

    // 1. เข้าถึงโฟลเดอร์หลัก
    const parentFolder = DriveApp.getFolderById(TARGET_FOLDER_ID);

    // 2. ค้นหาหรือสร้างโฟลเดอร์ย่อยตามแผนกวิชา
    let deptFolder;
    const subfolders = parentFolder.getFoldersByName(department);
    if (subfolders.hasNext()) {
      deptFolder = subfolders.next();
    } else {
      deptFolder = parentFolder.createFolder(department);
    }

    // 3. แปลง Base64 เป็นไฟล์ Word และบันทึกลงในโฟลเดอร์แผนก
    const decodedBytes = Utilities.base64Decode(fileBase64);
    const blob = Utilities.newBlob(
      decodedBytes,
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      fileName
    );
    const savedFile = deptFolder.createFile(blob);
    savedFile.setDescription(`ผู้บันทึก: ${studentName} | ระดับชั้น: ${level} | แผนก: ${department} | วันที่ส่ง: ${new Date().toLocaleString('th-TH')}`);

    // ส่งผลลัพธ์กลับไปยังเว็บแอป
    const result = {
      status: 'success',
      message: `บันทึกไฟล์ลงในโฟลเดอร์แผนก "${department}" เรียบร้อยแล้ว`,
      fileId: savedFile.getId(),
      fileUrl: savedFile.getUrl(),
      fileName: fileName,
      department: department,
      timestamp: new Date().toISOString()
    };

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    const errorResult = {
      status: 'error',
      message: error.toString()
    };
    return ContentService.createTextOutput(JSON.stringify(errorResult))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'online',
    message: 'Bompor Google Drive Endpoint พร้อมใช้งาน'
  })).setMimeType(ContentService.MimeType.JSON);
}
