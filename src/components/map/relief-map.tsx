"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import { Icon } from "@/components/icons";
import { iconData } from "@/components/icons/icon-data";
import { POINT_KINDS, getKindLabel } from "@/components/map/point-kind";
import { formatPlace } from "@/lib/algeria-cities";
import { FOCUS_RING } from "@/components/site";
import { getPointStatusLabel, getVerificationLabel } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { PointCardData } from "@/components/shared/point-card";
import type { AvailableLocale } from "@/i18n/locales";

/* Popup palette. These duplicate the tokens because maplibre builds the popup
   from a raw HTML string, outside anything Tailwind or a CSS variable on
   [data-site] can reach. design.md §5.5 */
const INK = "#15201B";
const INK_2 = "#3F4D46";
const MUTED = "#5B6B62";
const BORDER = "#DDE2DE";
const SURFACE_2 = "#F9FAF8";
const GREEN = "#0B5D3B";

/**
 * maplibre needs WebGL2. Without it the Map constructor fires an
 * error event, finishes with no painter, and the next map.remove() throws a
 * TypeError that reaches the route's error boundary and blanks the whole page —
 * list included, though the list needs no GPU. Probe first instead. design.md §5.5
 */
function hasWebGL2() {
  try {
    return Boolean(document.createElement("canvas").getContext("webgl2"));
  } catch {
    return false;
  }
}

function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string,
  );
}

/** The same hugeicons markup the React <Icon> renders, as a string. */
function iconSvg(name: keyof typeof iconData, size: number, color: string) {
  const { vb, body } = iconData[name];
  return `<svg viewBox="${vb}" width="${size}" height="${size}" aria-hidden="true" style="color:${color};display:block">${body}</svg>`;
}

export function ReliefMap({
  points,
  selectedPointId,
  onSelectPoint,
  locale = "ar",
}: {
  points: PointCardData[];
  selectedPointId?: string | null;
  onSelectPoint?: (point: PointCardData) => void;
  locale?: AvailableLocale;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<
    Map<string, { marker: maplibregl.Marker; point: PointCardData; el: HTMLElement; handler: () => void }>
  >(new Map());
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [mapStyle, setMapStyle] = useState<"standard" | "humanitarian">("standard");
  // Probed in a lazy initialiser, not an effect: the answer cannot change for
  // the life of the component, and setting it from inside the effect makes the
  // first paint render a map container that is then thrown away.
  const [failed, setFailed] = useState(() => typeof document !== "undefined" && !hasWebGL2());
  const isFr = locale === "fr";

  const fitAll = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const bounds = new maplibregl.LngLatBounds();
    let any = false;
    for (const point of points) {
      if (point.lat === null || point.lng === null) continue;
      bounds.extend([point.lng, point.lat]);
      any = true;
    }
    if (any) map.fitBounds(bounds, { padding: 50, maxZoom: 11, duration: 800 });
  }, [points]);

  const handleLocateMe = () => {
    if (!navigator.geolocation || !mapRef.current) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.longitude, pos.coords.latitude];
        setUserLocation(coords);
        mapRef.current?.flyTo({ center: coords, zoom: 12, essential: true, duration: 1000 });
      },
      () => {},
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const tileUrl =
      mapStyle === "humanitarian"
        ? "https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
        : "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

    if (failed) return;

    let map: maplibregl.Map;
    try {
      map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: [tileUrl],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors",
          },
        },
        layers: [{ id: "osm", type: "raster", source: "osm" }],
      },
      center: [5.9, 36.75],
      zoom: 8.5,
      minZoom: 5,
      maxBounds: [
        [-2.5, 28],
        [12, 39],
      ],
      });
    } catch {
      // Anything else that stops the GL context from coming up.
      queueMicrotask(() => setFailed(true));
      return;
    }

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-left");
    mapRef.current = map;

    return () => {
      try {
        map.remove();
      } catch {
        // A map whose GL context died has no painter left to destroy.
      }
      mapRef.current = null;
    };
  }, [mapStyle, failed]);

  // Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach(({ marker }) => marker.remove());
    markersRef.current.clear();

    const addMarkers = () => {
      const bounds = new maplibregl.LngLatBounds();
      let any = false;

      for (const point of points) {
        if (point.lat === null || point.lng === null) continue;
        any = true;
        bounds.extend([point.lng, point.lat]);

        const kind = POINT_KINDS[point.kind];
        const isSelected = selectedPointId === point.id;
        const size = isSelected ? 36 : 30;

        // Square pin with a diamond tail — the system has no radius, so the
        // usual teardrop is drawn as a rotated square instead. design.md §3.1
        //
        // Set no `position` and no `transform` here. `.maplibregl-marker` is a
        // class rule carrying `position: absolute`, and an inline value beats
        // it: the marker then lays out in normal flow at the container's full
        // width, so maplibre's own `translate(-50%, -100%)` resolves -50%
        // against ~1000px instead of the 34px pin and throws every box half a
        // map to the left. `position: absolute` is also what makes the element
        // the containing block the tail is positioned against, so the tail
        // needs nothing else. maplibre owns `transform` and overwrites it on
        // every frame.
        const el = document.createElement("div");
        el.style.cursor = "pointer";

        const box = document.createElement("div");
        box.style.cssText = `
          display:flex;align-items:center;justify-content:center;
          width:${size}px;height:${size}px;background:${kind.hex};
          border:2px solid #ffffff;outline:1px solid ${kind.hex};
          transition:transform .15s ease;transform-origin:50% 100%;
        `;
        box.innerHTML = iconSvg(kind.icon, isSelected ? 18 : 16, "#ffffff");

        // bottom:3px, not a negative value: rotating a 14px square (10px plus
        // its border) 45deg pushes its lowest corner ~9.9px below the square's
        // own box, and `anchor: "bottom"` puts the element's bottom edge on the
        // coordinate. 3px lands that corner on the point rather than 8px under it.
        const tail = document.createElement("div");
        tail.style.cssText = `
          position:absolute;left:50%;bottom:3px;width:10px;height:10px;
          background:${kind.hex};border:2px solid #ffffff;
          transform:translateX(-50%) rotate(45deg);z-index:-1;
        `;

        el.append(box, tail);
        el.onmouseenter = () => (box.style.transform = "scale(1.12)");
        el.onmouseleave = () => (box.style.transform = "scale(1)");

        const tel = point.phone ? point.phone.replace(/\s/g, "") : null;
        const dir = `https://www.google.com/maps/dir/?api=1&destination=${point.lat},${point.lng}`;
        const dirStyle = isFr ? "direction:ltr;text-align:left" : "direction:rtl;text-align:right";
        const placeText = esc(point.address ?? formatPlace(point.commune, point.wilaya, locale));
        const rowStyle = `display:flex;align-items:center;gap:6px;margin:0 0 5px;font-size:12.5px;color:${INK_2}`;
        const btnStyle =
          "flex:1;display:inline-flex;align-items:center;justify-content:center;gap:6px;" +
          "padding:8px 10px;text-decoration:none;font-size:12.5px;font-weight:700;border:1px solid";

        const popupHtml = `
          <div style="${dirStyle};min-width:236px;max-width:280px;font-family:inherit">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px">
              <span style="display:inline-flex;align-items:center;gap:5px;border:1px solid ${kind.hex};padding:2px 7px;font-size:11px;font-weight:700;color:${kind.hex}">
                ${iconSvg(kind.icon, 12, kind.hex)}${esc(getKindLabel(point.kind, locale))}
              </span>
              <span style="font-size:11px;color:${MUTED}">${esc(getVerificationLabel(point.verificationLevel, locale))}</span>
            </div>

            <h4 style="margin:0 0 5px;font-size:15px;font-weight:700;line-height:1.35;color:${INK}">
              ${esc(point.name)}
            </h4>

            <p style="${rowStyle}">
              ${iconSvg("location-01", 14, MUTED)}<span>${placeText}</span>
            </p>

            ${
              point.openingHours
                ? `<p style="${rowStyle}">${iconSvg("clock-01", 14, MUTED)}<span>${esc(point.openingHours)}</span></p>`
                : ""
            }

            <p style="${rowStyle}">
              <span style="width:8px;height:8px;background:${point.status === "open" ? GREEN : MUTED};display:inline-block"></span>
              <span>${esc(getPointStatusLabel(point.status, locale))}</span>
            </p>

            <div style="display:flex;gap:8px;margin-top:10px;padding-top:10px;border-top:1px solid ${BORDER}">
              ${
                tel
                  ? `<a href="tel:${esc(tel)}" style="${btnStyle} ${GREEN};background:${GREEN};color:#ffffff">
                       ${iconSvg("call-02", 15, "#ffffff")}${isFr ? "Appeler" : "اتصال"}
                     </a>`
                  : ""
              }
              <a href="${esc(dir)}" target="_blank" rel="noopener noreferrer"
                 style="${btnStyle} ${GREEN};background:${SURFACE_2};color:${GREEN}">
                ${iconSvg("navigation-03", 15, GREEN)}${isFr ? "Itinéraire" : "الاتجاهات"}
              </a>
            </div>
          </div>`;

        const popup = new maplibregl.Popup({
          offset: size + 4,
          maxWidth: "300px",
          closeButton: true,
          closeOnClick: false,
        }).setHTML(popupHtml);

        const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
          .setLngLat([point.lng, point.lat])
          .setPopup(popup)
          .addTo(map);

        const handler = () => onSelectPoint?.(point);
        el.addEventListener("click", handler);

        markersRef.current.set(point.id, { marker, point, el, handler });
      }

      if (any && !selectedPointId) {
        map.fitBounds(bounds, { padding: 60, maxZoom: 11, duration: 600 });
      }
    };

    if (map.isStyleLoaded()) addMarkers();
    else map.once("load", addMarkers);

    const currentMarkers = markersRef.current;
    return () => {
      map.off("load", addMarkers);
      currentMarkers.forEach(({ marker, el, handler }) => {
        el.removeEventListener("click", handler);
        marker.remove();
      });
      currentMarkers.clear();
    };
  }, [points, locale, isFr, selectedPointId, onSelectPoint]);

  // Fly to the selection made in the list.
  useEffect(() => {
    if (!selectedPointId || !mapRef.current) return;
    const target = markersRef.current.get(selectedPointId);
    if (target && target.point.lat !== null && target.point.lng !== null) {
      mapRef.current.flyTo({
        center: [target.point.lng, target.point.lat],
        zoom: 13,
        essential: true,
        duration: 900,
      });
      if (!target.marker.getPopup()?.isOpen()) target.marker.togglePopup();
    }
  }, [selectedPointId]);

  const controlClass = cn(
    "flex size-10 items-center justify-center border-b border-haba-border bg-haba-surface text-haba-ink-2 last:border-b-0 hover:bg-haba-surface-2 hover:text-haba-green",
    FOCUS_RING,
  );

  if (failed) {
    return (
      <div className="flex size-full flex-col items-center justify-center gap-2 bg-haba-map px-6 text-center">
        <Icon name="maps" size={26} className="text-haba-muted" />
        <p className="text-[14px] font-bold text-haba-ink">
          {isFr ? "Carte indisponible sur cet appareil" : "الخريطة غير متاحة على هذا الجهاز"}
        </p>
        <p className="max-w-[380px] text-[12.5px] leading-relaxed text-haba-muted">
          {isFr
            ? "Votre navigateur ne prend pas en charge WebGL2. La liste des centres ci-contre reste complète."
            : "متصفحك لا يدعم WebGL2. قائمة المراكز المجاورة تعمل بشكل كامل وتحتوي على كل المعلومات."}
        </p>
      </div>
    );
  }

  return (
    <div className="relative size-full">
      <div ref={containerRef} className="size-full" />

      <div className="absolute top-3 end-3 z-10 flex flex-col border border-haba-border">
        <button
          type="button"
          onClick={handleLocateMe}
          title={isFr ? "Ma position (GPS)" : "تحديد موقعي الحالي (GPS)"}
          aria-label={isFr ? "Ma position" : "موقعي الحالي"}
          className={controlClass}
        >
          <Icon name="location-user-02" size={19} />
        </button>
        <button
          type="button"
          onClick={fitAll}
          title={isFr ? "Afficher tous les points" : "عرض كل النقاط"}
          aria-label={isFr ? "Afficher tous les points" : "عرض كل النقاط"}
          className={controlClass}
        >
          <Icon name="square-arrow-expand-01" size={19} />
        </button>
        <button
          type="button"
          onClick={() => setMapStyle((s) => (s === "standard" ? "humanitarian" : "standard"))}
          title={isFr ? "Changer le style de carte" : "تغيير نمط الخريطة"}
          aria-label={isFr ? "Changer le style de carte" : "تغيير نمط الخريطة"}
          aria-pressed={mapStyle === "humanitarian"}
          className={controlClass}
        >
          <Icon name="layers-01" size={19} />
        </button>
      </div>

      {userLocation && (
        <p className="absolute bottom-3 start-3 z-10 flex items-center gap-2 border border-haba-border bg-haba-surface px-3 py-1.5 text-[12.5px] font-semibold text-haba-green">
          <span aria-hidden className="size-2 bg-haba-green" />
          {isFr ? "Position GPS détectée" : "تم تحديد موقعك"}
        </p>
      )}
    </div>
  );
}
