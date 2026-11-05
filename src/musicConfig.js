/**
 * ============================================================================
 * หลังบ้านระบบเพลง (Music Configuration)
 * ============================================================================
 * - ค่าเริ่มต้น (Default): https://www.youtube.com/watch?v=6MCiaKFkhfg&t=13s
 * - แอดมินสามารถเปลี่ยนลิงก์เพลงจากระบบหลังบ้านได้ตลอดเวลา (Admin Dashboard -> Settings -> Background Music)
 * - เมื่อบันทึกเพลงใหม่ เพลงจะเปลี่ยนเป็นเพลงใหม่ทันที ไม่มีบั๊กเด้งกลับเพลงเดิม
 * ============================================================================
 */

export const DEFAULT_MUSIC_URL = 'https://www.youtube.com/watch?v=6MCiaKFkhfg&t=13s'

export const musicConfig = {
  // เปิดใช้งานระบบเพลง (true = เปิด, false = ปิด)
  enabled: true,

  // เล่นอัตโนมัติเมื่อมีเพลง
  autoPlay: true,

  // เล่นวน Loop เรื่อยๆ
  loop: true,

  // ระดับเสียงเริ่มต้น (0.0 ถึง 1.0)
  defaultVolume: 0.8,

  // วินาทีเริ่มต้นของเพลง (Default Start Time)
  startTime: 13,

  // รายการเพลงเริ่มต้น (Default)
  tracks: [
    {
      id: 'track-1',
      title: 'bye (Altare remix)',
      artist: 'Ariana Grande',
      src: DEFAULT_MUSIC_URL,
      startTime: 13,
      cover: '/asset/diffsnow-logo.png',
    },
  ],
}
