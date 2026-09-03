import { notFound } from "next/navigation";

import { Icon } from "@/components/icons";
import {
  Action,
  Chip,
  ChoiceCard,
  EmergencyNumbers,
  Eyebrow,
  Field,
  FieldInput,
  FieldPhoneInput,
  FieldSelect,
  FieldTextarea,
  FlagStripe,
  FormStep,
  HairlineCell,
  HairlineGrid,
  HairlineRail,
  NoticeBlock,
  SectionHeader,
  StatTile,
  StatusDot,
  WarningBlock,
} from "@/components/site";

/**
 * Living reference for the primitives in design.md §3.
 * Dev-only: it never resolves in a production build.
 */
export default function DesignSystemPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10 desktop:px-6">
      <h1 className="mb-2 text-[clamp(26px,4.8vw,46px)] font-bold text-haba-forest">
        نظام التصميم
      </h1>
      <p className="mb-10 max-w-[760px] text-[16.5px] leading-relaxed text-haba-ink-2">
        مرجع حيّ لعناصر الواجهة — design.md §3
      </p>

      <Row title="§3.2 FlagStripe">
        <FlagStripe />
      </Row>

      <Row title="§3.7 Action">
        <div className="flex flex-wrap items-center gap-2.5">
          <Action variant="primary" icon="gift">سجّل مساعدتك</Action>
          <Action variant="danger" icon="alert-02">أحتاج مساعدة</Action>
          <Action variant="outline" icon="maps-location-02">مراكز الإيواء</Action>
          <Action variant="neutral">ثانوي</Action>
          <Action variant="primary" size="sm">صغير</Action>
          <Action variant="primary" size="md">متوسط</Action>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2.5 bg-haba-forest p-5">
          <Action variant="onDark">سجّل كمتطوع ميداني</Action>
          <Action variant="onDarkOutline">مراكز التجميع</Action>
        </div>
        <div className="mt-3">
          <Action variant="danger" size="submit" icon="sent">
            إرسال طلب الإغاثة والمساعدة
          </Action>
        </div>
      </Row>

      <Row title="§3.8 Chip · StatusDot · Eyebrow">
        <Eyebrow index={1}>النشرة</Eyebrow>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Chip tone="red" fill="outline" size="md">
            <StatusDot tone="red" /> متابعة نشطة — حملة حرائق الشمال الشرقي
          </Chip>
          <Chip tone="red" fill="solid" size="md"><Icon name="flash" /> 18 - جيجل</Chip>
          <Chip tone="red" fill="tint" size="md"><Icon name="flash" /> 06 - بجاية</Chip>
          <Chip tone="red" fill="tint" size="sm">مرتفع</Chip>
          <Chip tone="amber" fill="tint" size="sm">متوسط</Chip>
          <Chip tone="green" fill="tint" size="sm">منخفض</Chip>
          <Chip tone="ink" fill="outline" size="xs">مركز إيواء</Chip>
          <Chip tone="green" fill="outline" size="xs">مركز استقبال</Chip>
          <Chip tone="amber" fill="outline" size="xs">نقطة تجميع</Chip>
          <Chip tone="green" fill="solid" size="lg">جميع المصادر</Chip>
        </div>
      </Row>

      <Row title="§3.1 HairlineGrid + §3.9 StatTile">
        <HairlineGrid min={280}>
          <StatTile value="12" label="نقطة استقبال للمساعدات" icon="package" tone="green" />
          <StatTile value="55" label="بلدية متضررة" icon="fire" tone="red" />
          <StatTile value="5" label="مراكز إيواء مفتوحة" icon="home-09" />
          <StatTile value="4" label="ولايات معنيّة بالحملة" icon="map-pinpoint-02" />
        </HairlineGrid>
      </Row>

      <Row title="§3.1 HairlineRail (mobile wilaya rail)">
        <HairlineRail className="border border-haba-border">
          {["بجاية", "جيجل", "سكيكدة", "ميلة"].map((w) => (
            <HairlineCell key={w} className="shrink-0 p-4">
              <div className="flex items-center gap-1.5 text-[15.5px] font-bold">
                <Icon name="location-05" className="text-haba-green" /> ولاية {w}
              </div>
              <div className="mt-1 text-[26px] font-bold text-haba-red">17</div>
            </HairlineCell>
          ))}
        </HairlineRail>
      </Row>

      <Row title="§3.10 SectionHeader">
        <SectionHeader
          index={1}
          eyebrow="النشرة"
          icon="news"
          title="آخر المستجدات الموثّقة"
          action={{ href: "/official-information", label: "كل المستجدات" }}
        />
        <SectionHeader
          index={2}
          eyebrow="الجغرافيا"
          icon="map-pinpoint-02"
          title="المناطق المتضررة"
          caption="55 بلدية عبر 4 ولايات"
        />
      </Row>

      <Row title="§3.12 FormStep + §3.11 Field">
        <FormStep step={1} title="بيانات الاتصال ومكان التواجد">
          <div className="grid gap-3.5 desktop:grid-cols-2">
            <Field label="الاسم واللقب" required htmlFor="ds-name">
              <FieldInput id="ds-name" placeholder="مثال: عبد القادر بوعلام" />
            </Field>
            <Field label="رقم الهاتف للتواصل المباشر" required htmlFor="ds-phone">
              <FieldPhoneInput id="ds-phone" placeholder="0555xxxxxx" />
            </Field>
            <Field label="الولاية" required htmlFor="ds-wilaya">
              <FieldSelect id="ds-wilaya" defaultValue="جيجل">
                {["جيجل", "بجاية", "سكيكدة", "ميلة"].map((w) => (
                  <option key={w}>{w}</option>
                ))}
              </FieldSelect>
            </Field>
            <Field label="ملاحظات" htmlFor="ds-notes" hint="اختياري">
              <FieldTextarea id="ds-notes" placeholder="أي احتياجات خاصة…" />
            </Field>
          </div>
        </FormStep>
      </Row>

      <Row title="§3.13 ChoiceCard">
        <div className="grid gap-3 desktop:grid-cols-3">
          <ChoiceCard name="ds-housing" icon="house-04" title="نعم، صالح للإقامة" defaultChecked />
          <ChoiceCard name="ds-housing" tone="danger" icon="house-01" title="أضرار جزئية" />
          <ChoiceCard name="ds-housing" icon="house-01" title="لا، متضرر أو تم إخلاؤه" />
        </div>
        <div className="mt-3 grid gap-3 desktop:grid-cols-2">
          <ChoiceCard
            type="checkbox"
            name="ds-delivery"
            icon="truck-delivery"
            title="أستطيع نقلها بنفسي لنقطة تجميع"
            description="تسليم المواد لأقرب مركز استقبال أو جمعية معتمدة"
            defaultChecked
          />
          <ChoiceCard
            type="checkbox"
            name="ds-delivery2"
            icon="delivery-truck-02"
            title="أحتاج إلى وسيلة شحن / نقل"
            description="نربطك بسائقين متطوعين لاستلام المواد"
          />
        </div>
        <div className="mt-3 grid gap-3 desktop:grid-cols-4">
          {["ماء", "غذاء", "ملابس", "بطانيات"].map((n) => (
            <ChoiceCard key={n} type="checkbox" name={`ds-need-${n}`} compact icon="water-energy" title={n} />
          ))}
        </div>
        <div className="mt-3 grid gap-3 desktop:grid-cols-2">
          <ChoiceCard type="checkbox" name="ds-eq" showControl title="أحذية أمان قوية" />
          <ChoiceCard type="checkbox" name="ds-eq2" showControl title="قفازات عمل متينة" />
        </div>
      </Row>

      <Row title="§3.16 WarningBlock">
        <WarningBlock title="كيف تُساهم في الميدان بأمان وفعالية؟">
          في أوقات الطوارئ، الحضور غير المنسق قد يُربك حركة الإغاثة أو يُعرّض المتطوعين للخطر.
        </WarningBlock>
      </Row>

      <Row title="§3.15 NoticeBlock">
        <NoticeBlock
          title="ملاحظة هامة"
          statements={[
            { lead: "لا تجمع المنصة أي أموال.", body: "لا حسابات بنكية، لا تحويلات، لا وسيلة دفع مهما كانت." },
            { lead: "ليست منصة لجمع التبرعات.", body: "هدفها تنظيم المساعدات العينية وتوجيهها للولايات المتضررة." },
            { lead: "لا تجمع أي معطيات شخصية", body: "خارج الاسم ورقم الهاتف، وتُستخدم حصراً للتواصل الميداني." },
          ]}
          footer={
            <>
              <span>الكود المصدري مفتوح بالكامل.</span>
              <span className="inline-flex items-center gap-2 font-semibold text-haba-green">
                <Icon name="github" /> الكود المصدري على GitHub ←
              </span>
            </>
          }
        />
      </Row>

      <Row title="§3.17 EmergencyNumbers">
        <EmergencyNumbers
          title="أرقام الطوارئ الوطنية (مجانية على مدار الساعة)"
          note="اتصل بها مباشرة، وليس بالمنصة"
          items={[
            { number: "14", name: "الحماية المدنية", sub: "حرائق وإنقاذ" },
            { number: "1021", name: "الرقم الأخضر", sub: "الحماية المدنية" },
            { number: "1055", name: "الدرك الوطني", sub: "الطرقات" },
            { number: "17", name: "الشرطة", sub: "الأمن الوطني" },
            { number: "1548", name: "الرقم الأخضر", sub: "الأمن الوطني" },
          ]}
        />
      </Row>
    </div>
  );
}

function Row({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="mb-3 border-b border-haba-border pb-2 font-haba-display text-[13px] font-bold tracking-wide text-haba-muted">
        {title}
      </h2>
      {children}
    </section>
  );
}
