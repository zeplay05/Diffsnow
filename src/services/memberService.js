// ─── Pure Static Member Service (Frontend Static สำหรับ Vercel) ────────────────
const defaultData = { data: {} };

// รายชื่อผู้ก่อตั้ง 6 คนที่ยศต้องเป็น HEAD (Rank 1) ตลอดกาล ห้ามเปลี่ยน
export const FIXED_HEAD_NAMES = [
  'awake unfair',
  'rix triples',
  'summer triples',
  'song triples',
  'yawhan triples',
  'normal triples',
]

// Key mapping สำหรับกลุ่มสมาชิกทั้งหมด (รองรับทั้งตัวพิมพ์ใหญ่และตัวพิมพ์เล็ก)
export const ROSTER_KEYS = {
  'DIFFSNOW': 'diffsnow',
  'diffsnow': 'diffsnow',
  'MAIN TRIPLES': 'members',
  'TRIPLES PERFECT': 'triples_perfect',
  'TRIPLES LADY': 'triples_lady',
  'TAMSTEP': 'tamstep',
  'PERFECT': 'perfect',
  'HEREWEGOAGAIN': 'herewegoagain',
  'BABYYOUOK': 'babyyouok',
  'ROCKS': 'rocks',
  'members': 'members',
  'triples_perfect': 'triples_perfect',
  'triples_lady': 'triples_lady',
  'tamstep': 'tamstep',
  'perfect': 'perfect',
  'herewegoagain': 'herewegoagain',
  'babyyouok': 'babyyouok',
  'rocks': 'rocks',
}

const ALL_ROSTER_KEYS = [
  'diffsnow',
  'members',
  'triples_perfect',
  'triples_lady',
  'tamstep',
  'perfect',
  'herewegoagain',
  'babyyouok',
  'rocks',
]

const STORAGE_KEY = 'diffsnow_roster_data'

// ดึงข้อมูลตั้งต้นจาก members.json (รองรับทั้งรูปแบบห่อหุ้ม { data: ... } หรือ object ตรง)
const baseDefault = defaultData?.data && typeof defaultData.data === 'object' && !Array.isArray(defaultData.data)
  ? defaultData.data
  : defaultData

// ฟังก์ชันล็อกยศ HEAD ให้ 6 ผู้ก่อตั้งถาวร
function enforceFixedHeads(membersList) {
  if (!Array.isArray(membersList)) return membersList
  return membersList.map((m) => {
    const nameLower = (m.name || m.username || '').toLowerCase().trim()
    if (FIXED_HEAD_NAMES.includes(nameLower)) {
      return {
        ...m,
        role: 'Head',
        rankOrder: '1',
      }
    }
    return m
  })
}

// ฟังก์ชันโหลดข้อมูลสมาชิกจาก LocalStorage แบบครอบคลุมทุก Key และไม่ให้ข้อมูลสูญหาย
function loadStoredDB() {
  const merged = { ...baseDefault }

  // 1. ล็อกยศ HEAD ใน members เริ่มต้นทันที
  if (merged.members) {
    merged.members = enforceFixedHeads(merged.members)
  }

  if (typeof window === 'undefined') return merged

  let storedObject = {}
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed && typeof parsed === 'object') {
        const valid = parsed?.data && typeof parsed.data === 'object' && !Array.isArray(parsed.data) ? parsed.data : parsed
        storedObject = { ...valid }
      }
    }
  } catch (e) {
    console.warn('LocalStorage load notice:', e)
  }

  // 2. ดึงข้อมูลจากคีย์ย่อยเพิ่มเติม (เช่น triples_members_babyyouok) เพื่อป้องกันตกหล่น
  ALL_ROSTER_KEYS.forEach((k) => {
    // ถ้าใน storedObject ยังไม่มีข้อมูล หรือเป็น array ว่าง ให้หาจากคีย์ย่อย
    if (!storedObject[k] || !Array.isArray(storedObject[k]) || storedObject[k].length === 0) {
      try {
        const ind = localStorage.getItem(`triples_members_${k}`) || localStorage.getItem(`triples_admin_${k}`)
        if (ind) {
          const parsedInd = JSON.parse(ind)
          if (Array.isArray(parsedInd) && parsedInd.length > 0) {
            storedObject[k] = parsedInd
          }
        }
      } catch (e) {}
    }
  })

  // 3. รวมเข้ากับ baseDefault โดยเอารายการที่มีข้อมูลจริงเป็นหลัก
  Object.keys(storedObject).forEach((k) => {
    if (Array.isArray(storedObject[k]) && storedObject[k].length > 0) {
      merged[k] = storedObject[k]
    }
  })

  // 4. บังคับยศ HEAD ของ 6 คนหลักเสมอ ไม่ว่าจะโหลดมาจากไหนก็ตาม
  if (merged.members) {
    merged.members = enforceFixedHeads(merged.members)
  }

  return merged
}

// In-memory cache เริ่มต้น
let memoryDB = loadStoredDB()

// Subscribers สำหรับแจ้งเตือนเมื่อมีการเปลี่ยนแปลงข้อมูล
const listeners = new Set()

export const subscribeToRosterChanges = (callback) => {
  listeners.add(callback)
  return () => listeners.delete(callback)
}

const notifyListeners = () => {
  listeners.forEach((cb) => {
    try {
      cb(memoryDB)
    } catch (e) {
      console.error(e)
    }
  })
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('triples_roster_updated', { detail: memoryDB }))
  }
}

// โหลดข้อมูลสมาชิกทั้งหมด
export async function fetchAllMembers() {
  try {
    if (typeof window !== 'undefined') {
      // ดึงข้อมูลล่าสุดจาก public/data/members.json เผื่อมีการอัปเดตไฟล์
      try {
        const res = await fetch(`/data/members.json?t=${Date.now()}`)
        if (res.ok) {
          const remoteJson = await res.json()
          const remoteData = remoteJson?.data && typeof remoteJson.data === 'object' && !Array.isArray(remoteJson.data)
            ? remoteJson.data
            : remoteJson
          if (remoteData && typeof remoteData === 'object') {
            Object.assign(baseDefault, remoteData)
          }
        }
      } catch (err) {}

      // โหลดและรวมข้อมูลทั้งหมด
      memoryDB = loadStoredDB()
      notifyListeners()
      return memoryDB
    }
  } catch (e) {}

  memoryDB = loadStoredDB()
  notifyListeners()
  return memoryDB
}

// ดึงข้อมูลทั้งหมดในฐานข้อมูล (Synchronous สำหรับ UI render ทันที)
export function getAllMembers() {
  return memoryDB
}

// ดึงข้อมูลสมาชิกของกลุ่มที่ระบุ
export function getRosterMembers(rosterId) {
  const key = ROSTER_KEYS[rosterId] || rosterId || 'members'
  return memoryDB[key] || []
}

// บันทึกฐานข้อมูลสมาชิกทั้งหมดลง LocalStorage (บันทึกทั้งคีย์รวม และคีย์ย่อยแต่ละกลุ่ม)
export async function saveAllMembers(newData) {
  // บังคับยศ 6 ผู้ก่อตั้งห้ามเปลี่ยน
  if (newData.members) {
    newData.members = enforceFixedHeads(newData.members)
  }

  memoryDB = { ...memoryDB, ...newData }
  notifyListeners()

  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryDB))

      // บันทึกสำรองลงคีย์เฉพาะของแต่ละกลุ่มด้วย เพื่อความแน่นอน 100%
      ALL_ROSTER_KEYS.forEach((k) => {
        if (memoryDB[k] !== undefined) {
          try {
            localStorage.setItem(`triples_members_${k}`, JSON.stringify(memoryDB[k]))
          } catch (e) {}
        }
      })
    }
    return true
  } catch (err) {
    console.error('Failed to save members to LocalStorage:', err)
    return false
  }
}

// บันทึกเฉพาะกลุ่มสมาชิก (เช่น เมื่อแก้ไขในแผง Admin หรือสลับตำแหน่ง)
export async function saveRosterMembers(rosterId, memberList) {
  const key = ROSTER_KEYS[rosterId] || rosterId || 'members'
  const finalMemberList = key === 'members' ? enforceFixedHeads(memberList) : memberList

  const updated = {
    ...memoryDB,
    [key]: finalMemberList,
  }

  // เซฟลงคีย์ย่อยทันที
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`triples_members_${key}`, JSON.stringify(finalMemberList))
    }
  } catch (e) {}

  return await saveAllMembers(updated)
}

// อัปเดตรูปโปรไฟล์ของสมาชิกรายบุคคล
export async function updateMemberAvatar(memberIdOrName, newAvatarUrl, groupNameOrKey) {
  let targetKey = ROSTER_KEYS[groupNameOrKey] || groupNameOrKey

  if (!targetKey || !memoryDB[targetKey]) {
    for (const k of Object.keys(memoryDB)) {
      if (Array.isArray(memoryDB[k])) {
        const found = memoryDB[k].some(
          (m) => m.id === memberIdOrName || m.name === memberIdOrName
        )
        if (found) {
          targetKey = k
          break
        }
      }
    }
  }

  targetKey = targetKey || 'members'
  const currentList = memoryDB[targetKey] || []
  const updatedList = currentList.map((m) => {
    if (m.id === memberIdOrName || (m.name && m.name === memberIdOrName)) {
      return {
        ...m,
        avatar: newAvatarUrl,
        imageUrl: newAvatarUrl,
      }
    }
    return m
  })

  return await saveRosterMembers(targetKey, updatedList)
}

// เริ่มต้นแจ้งเตือนทันทีเมื่อโมดูลโหลด
if (typeof window !== 'undefined') {
  setTimeout(() => notifyListeners(), 0)
}
