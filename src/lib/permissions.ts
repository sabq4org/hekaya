import { Role } from '@prisma/client'

// تعريف الصلاحيات المختلفة
export enum Permission {
  // إدارة المقالات
  CREATE_POST = 'CREATE_POST',
  READ_POST = 'READ_POST',
  UPDATE_POST = 'UPDATE_POST',
  DELETE_POST = 'DELETE_POST',
  PUBLISH_POST = 'PUBLISH_POST',
  ARCHIVE_POST = 'ARCHIVE_POST',
  
  // إدارة الأقسام
  CREATE_SECTION = 'CREATE_SECTION',
  READ_SECTION = 'READ_SECTION',
  UPDATE_SECTION = 'UPDATE_SECTION',
  DELETE_SECTION = 'DELETE_SECTION',
  
  // إدارة الوسوم
  CREATE_TAG = 'CREATE_TAG',
  READ_TAG = 'READ_TAG',
  UPDATE_TAG = 'UPDATE_TAG',
  DELETE_TAG = 'DELETE_TAG',
  MERGE_TAG = 'MERGE_TAG',
  
  // إدارة التعليقات
  READ_COMMENT = 'READ_COMMENT',
  APPROVE_COMMENT = 'APPROVE_COMMENT',
  REJECT_COMMENT = 'REJECT_COMMENT',
  DELETE_COMMENT = 'DELETE_COMMENT',
  MARK_SPAM = 'MARK_SPAM',
  
  // إدارة الوسائط
  UPLOAD_MEDIA = 'UPLOAD_MEDIA',
  READ_MEDIA = 'READ_MEDIA',
  DELETE_MEDIA = 'DELETE_MEDIA',
  MANAGE_MEDIA_LIBRARY = 'MANAGE_MEDIA_LIBRARY',
  
  // إدارة المستخدمين
  CREATE_USER = 'CREATE_USER',
  READ_USER = 'READ_USER',
  UPDATE_USER = 'UPDATE_USER',
  DELETE_USER = 'DELETE_USER',
  ASSIGN_ROLE = 'ASSIGN_ROLE',
  SUSPEND_USER = 'SUSPEND_USER',
  
  // إدارة النشرة البريدية
  READ_NEWSLETTER = 'READ_NEWSLETTER',
  SEND_NEWSLETTER = 'SEND_NEWSLETTER',
  MANAGE_SUBSCRIBERS = 'MANAGE_SUBSCRIBERS',
  
  // إدارة الإعدادات
  READ_SETTINGS = 'READ_SETTINGS',
  UPDATE_SETTINGS = 'UPDATE_SETTINGS',
  SYSTEM_SETTINGS = 'SYSTEM_SETTINGS',
  
  // التحليلات والتقارير
  READ_ANALYTICS = 'READ_ANALYTICS',
  EXPORT_DATA = 'EXPORT_DATA',
  
  // النظام والأمان
  READ_AUDIT_LOG = 'READ_AUDIT_LOG',
  MANAGE_BACKUP = 'MANAGE_BACKUP',
  SYSTEM_ADMIN = 'SYSTEM_ADMIN',
}

// تعريف الصلاحيات لكل دور
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.ADMIN]: [
    // المدير له جميع الصلاحيات
    ...Object.values(Permission)
  ],
  
  [Role.EDITOR]: [
    // المحرر يمكنه إدارة المحتوى والتعليقات
    Permission.CREATE_POST,
    Permission.READ_POST,
    Permission.UPDATE_POST,
    Permission.DELETE_POST,
    Permission.PUBLISH_POST,
    Permission.ARCHIVE_POST,
    
    Permission.CREATE_SECTION,
    Permission.READ_SECTION,
    Permission.UPDATE_SECTION,
    Permission.DELETE_SECTION,
    
    Permission.CREATE_TAG,
    Permission.READ_TAG,
    Permission.UPDATE_TAG,
    Permission.DELETE_TAG,
    Permission.MERGE_TAG,
    
    Permission.READ_COMMENT,
    Permission.APPROVE_COMMENT,
    Permission.REJECT_COMMENT,
    Permission.DELETE_COMMENT,
    Permission.MARK_SPAM,
    
    Permission.UPLOAD_MEDIA,
    Permission.READ_MEDIA,
    Permission.DELETE_MEDIA,
    Permission.MANAGE_MEDIA_LIBRARY,
    
    Permission.READ_NEWSLETTER,
    Permission.SEND_NEWSLETTER,
    Permission.MANAGE_SUBSCRIBERS,
    
    Permission.READ_ANALYTICS,
    Permission.EXPORT_DATA,
    
    Permission.READ_AUDIT_LOG,
  ],
  
  [Role.AUTHOR]: [
    // الكاتب يمكنه إدارة مقالاته ووسائطه فقط
    Permission.CREATE_POST,
    Permission.READ_POST,
    Permission.UPDATE_POST, // مقالاته فقط
    
    Permission.READ_SECTION,
    Permission.READ_TAG,
    Permission.CREATE_TAG,
    
    Permission.READ_COMMENT, // تعليقات مقالاته فقط
    
    Permission.UPLOAD_MEDIA,
    Permission.READ_MEDIA, // وسائطه فقط
    Permission.DELETE_MEDIA, // وسائطه فقط
    
    Permission.READ_ANALYTICS, // إحصائيات مقالاته فقط
  ],
  
  [Role.READER]: [
    // القارئ له صلاحيات محدودة جداً
    Permission.READ_POST,
    Permission.READ_SECTION,
    Permission.READ_TAG,
  ],
}

// فحص ما إذا كان المستخدم لديه صلاحية معينة
export function hasPermission(userRole: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[userRole].includes(permission)
}

// فحص صلاحيات متعددة
export function hasPermissions(userRole: Role, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(userRole, permission))
}

// فحص ما إذا كان المستخدم يمكنه الوصول لمورد معين
export function canAccessResource(
  userRole: Role,
  resourceType: 'post' | 'media' | 'comment',
  resourceOwnerId?: string,
  currentUserId?: string
): boolean {
  // المدير والمحرر يمكنهما الوصول لجميع الموارد
  if (userRole === Role.ADMIN || userRole === Role.EDITOR) {
    return true
  }
  
  // الكاتب يمكنه الوصول لموارده فقط
  if (userRole === Role.AUTHOR) {
    return resourceOwnerId === currentUserId
  }
  
  // القارئ لا يمكنه الوصول للموارد الخاصة
  return false
}

// فحص ما إذا كان المستخدم يمكنه تعديل مقال معين
export function canEditPost(
  userRole: Role,
  postAuthorId: string,
  currentUserId: string,
  postStatus: string
): boolean {
  // المدير والمحرر يمكنهما تعديل أي مقال
  if (userRole === Role.ADMIN || userRole === Role.EDITOR) {
    return true
  }
  
  // الكاتب يمكنه تعديل مقالاته فقط إذا لم تكن منشورة
  if (userRole === Role.AUTHOR && postAuthorId === currentUserId) {
    return postStatus !== 'PUBLISHED'
  }
  
  return false
}

// فحص ما إذا كان المستخدم يمكنه حذف مقال معين
export function canDeletePost(
  userRole: Role,
  postAuthorId: string,
  currentUserId: string
): boolean {
  // المدير فقط يمكنه حذف أي مقال
  if (userRole === Role.ADMIN) {
    return true
  }
  
  // المحرر يمكنه حذف مقالات غير منشورة فقط
  if (userRole === Role.EDITOR) {
    return true // يمكن تخصيص هذا أكثر حسب الحاجة
  }
  
  // الكاتب يمكنه حذف مقالاته غير المنشورة فقط
  if (userRole === Role.AUTHOR && postAuthorId === currentUserId) {
    return true // يمكن إضافة فحص حالة المقال
  }
  
  return false
}

// الحصول على قائمة الصلاحيات لدور معين
export function getPermissionsForRole(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role]
}

// فحص ما إذا كان الدور أعلى من دور آخر
export function isHigherRole(role1: Role, role2: Role): boolean {
  const roleHierarchy = {
    [Role.READER]: 0,
    [Role.AUTHOR]: 1,
    [Role.EDITOR]: 2,
    [Role.ADMIN]: 3,
  }
  
  return roleHierarchy[role1] > roleHierarchy[role2]
}

// فحص ما إذا كان المستخدم يمكنه تعيين دور معين
export function canAssignRole(currentUserRole: Role, targetRole: Role): boolean {
  // المدير فقط يمكنه تعيين أي دور
  if (currentUserRole === Role.ADMIN) {
    return true
  }
  
  // المحرر يمكنه تعيين أدوار أقل منه فقط
  if (currentUserRole === Role.EDITOR) {
    return targetRole === Role.AUTHOR || targetRole === Role.READER
  }
  
  return false
}

