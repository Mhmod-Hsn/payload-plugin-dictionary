import type { Payload } from 'payload'

import { devUser } from './helpers/credentials.js'

/**
 * Seeds the dev database with a user and sample translations
 * across multiple namespaces and locales.
 */
export const seed = async (payload: Payload) => {
  // ── Seed admin user ───────────────────────────────────────────────────────
  const { totalDocs: userCount } = await payload.count({
    collection: 'users',
    where: {
      email: {
        equals: devUser.email,
      },
    },
  })

  if (!userCount) {
    await payload.create({
      collection: 'users',
      data: devUser,
    })
  }

  // ── Seed translations ─────────────────────────────────────────────────────
  const { totalDocs: translationCount } = await payload.count({
    collection: 'translations',
  })

  // Only seed if the collection is empty.
  if (translationCount > 0) {
    return
  }

  const translations = [
    // ── common namespace ──
    {
      key: 'button.submit',
      namespace: 'common',
      value: 'Submit',
      value_ar: 'إرسال',
      value_fr: 'Soumettre',
    },
    {
      key: 'button.cancel',
      namespace: 'common',
      value: 'Cancel',
      value_ar: 'إلغاء',
      value_fr: 'Annuler',
    },
    {
      key: 'button.save',
      namespace: 'common',
      value: 'Save Changes',
      value_ar: 'حفظ التغييرات',
      value_fr: 'Enregistrer',
    },
    {
      key: 'nav.home',
      namespace: 'common',
      value: 'Home',
      value_ar: 'الرئيسية',
      value_fr: 'Accueil',
    },
    {
      key: 'nav.about',
      namespace: 'common',
      value: 'About Us',
      value_ar: 'من نحن',
      value_fr: 'À propos',
    },
    {
      key: 'nav.contact',
      namespace: 'common',
      value: 'Contact',
      value_ar: 'اتصل بنا',
      value_fr: 'Contact',
    },
    {
      key: 'footer.copyright',
      namespace: 'common',
      value: '© 2026 My Company. All rights reserved.',
      value_ar: '© 2026 شركتي. جميع الحقوق محفوظة.',
      value_fr: '© 2026 Mon Entreprise. Tous droits réservés.',
    },
    {
      key: 'footer.privacy',
      namespace: 'common',
      value: 'Privacy Policy',
      value_ar: 'سياسة الخصوصية',
      value_fr: 'Politique de confidentialité',
    },
    // ── auth namespace ──
    {
      key: 'login.title',
      namespace: 'auth',
      value: 'Sign In',
      value_ar: 'تسجيل الدخول',
      value_fr: 'Connexion',
    },
    {
      key: 'login.email_label',
      namespace: 'auth',
      value: 'Email Address',
      value_ar: 'البريد الإلكتروني',
      value_fr: 'Adresse e-mail',
    },
    {
      key: 'login.password_label',
      namespace: 'auth',
      value: 'Password',
      value_ar: 'كلمة المرور',
      value_fr: 'Mot de passe',
    },
    {
      key: 'login.submit',
      namespace: 'auth',
      value: 'Log In',
      value_ar: 'دخول',
      value_fr: 'Se connecter',
    },
    {
      key: 'error.invalid_credentials',
      namespace: 'auth',
      value: 'Invalid email or password.',
      value_ar: 'بريد إلكتروني أو كلمة مرور غير صالحة.',
      value_fr: 'E-mail ou mot de passe invalide.',
    },
    {
      key: 'error.session_expired',
      namespace: 'auth',
      value: 'Your session has expired. Please log in again.',
      value_ar: 'انتهت جلستك. يرجى تسجيل الدخول مجددًا.',
      value_fr: 'Votre session a expiré. Veuillez vous reconnecter.',
    },
    {
      key: 'register.title',
      namespace: 'auth',
      value: 'Create Account',
      value_ar: 'إنشاء حساب',
      value_fr: 'Créer un compte',
    },
    // ── marketing namespace ──
    {
      key: 'hero.title',
      namespace: 'marketing',
      value: 'Build Something Amazing',
      value_ar: 'ابنِ شيئًا مذهلاً',
      value_fr: "Construisez quelque chose d'incroyable",
    },
    {
      key: 'hero.subtitle',
      namespace: 'marketing',
      value: 'The fastest way to ship modern web applications.',
      value_ar: 'أسرع طريقة لإطلاق تطبيقات الويب الحديثة.',
      value_fr: 'Le moyen le plus rapide de livrer des applications web modernes.',
    },
    {
      key: 'cta.get_started',
      namespace: 'marketing',
      value: 'Get Started Free',
      value_ar: 'ابدأ مجانًا',
      value_fr: 'Commencer gratuitement',
    },
    {
      key: 'cta.learn_more',
      namespace: 'marketing',
      value: 'Learn More',
      value_ar: 'اعرف المزيد',
      value_fr: 'En savoir plus',
    },
    {
      key: 'testimonial.label',
      namespace: 'marketing',
      value: 'What Our Users Say',
      value_ar: 'ماذا يقول مستخدمونا',
      value_fr: 'Ce que disent nos utilisateurs',
    },
  ]

  payload.logger.info(`🌱 Seeding ${translations.length} translations...`)

  for (const t of translations) {
    // Create with the default locale (en) first.
    const doc = await payload.create({
      collection: 'translations',
      data: {
        key: t.key,
        namespace: t.namespace as any,
        value: t.value,
      },
      locale: 'en',
    })

    // Update Arabic locale.
    await payload.update({
      id: doc.id,
      collection: 'translations',
      data: {
        value: t.value_ar,
      },
      locale: 'ar',
    })

    // Update French locale.
    await payload.update({
      id: doc.id,
      collection: 'translations',
      data: {
        value: t.value_fr,
      },
      locale: 'fr',
    })
  }

  payload.logger.info('✅ Translation seeding complete.')
}
