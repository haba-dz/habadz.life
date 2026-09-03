"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { getPointStatusLabel, getVerificationLabel } from "@/lib/constants";
import type { PointCardData } from "@/components/shared/point-card";
import type { AvailableLocale } from "@/i18n/locales";
import { Locate, Maximize2, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

const colorByKind: Record<PointCardData["kind"], { bg: string; border: string; glow: string; text: string }> = {
  collection_point: {
    bg: "#00843D",
    border: "#00622e",
    glow: "rgba(0, 132, 61, 0.35)",
    text: "#00843D",
  },
  relief_hub: {
    bg: "#1d4ed8",
    border: "#173fae",
    glow: "rgba(29, 78, 216, 0.35)",
    text: "#1d4ed8",
  },
  shelter: {
    bg: "#7c3aed",
    border: "#6025c0",
    glow: "rgba(124, 58, 237, 0.35)",
    text: "#7c3aed",
  },
};

const nameByKind: Record<AvailableLocale, Record<PointCardData["kind"], string>> = {
  ar: {
    collection_point: "نقطة تجميع",
    relief_hub: "مركز استقبال",
    shelter: "مركز إيواء",
  },
  fr: {
    collection_point: "Point de collecte",
    relief_hub: "Centre d'accueil",
    shelter: "Centre d'hébergement",
  },
};

function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string,
  );
}

function getIconSvg(kind: PointCardData["kind"]) {
  if (kind === "shelter") {
    return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;
  }
  if (kind === "collection_point") {
    return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>`;
  }
  return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`;
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
  const markersRef = useRef<Map<string, { marker: maplibregl.Marker; popup: maplibregl.Popup; point: PointCardData; el: HTMLElement; handler: () => void }>>(new Map());
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [mapStyle, setMapStyle] = useState<"standard" | "humanitarian">("standard");
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
    if (any) {
      map.fitBounds(bounds, { padding: 50, maxZoom: 11, duration: 800 });
    }
  }, [points]);

  const handleLocateMe = () => {
    if (!navigator.geolocation || !mapRef.current) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.longitude, pos.coords.latitude];
        setUserLocation(coords);
        mapRef.current?.flyTo({
          center: coords,
          zoom: 12,
          essential: true,
          duration: 1000,
        });
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

    const map = new maplibregl.Map({
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

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-left");
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [mapStyle]);

  // Render & Update Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach(({ marker }) => marker.remove());
    markersRef.current.clear();

    const addMarkers = () => {
      const bounds = new maplibregl.LngLatBounds();
      let any = false;

      for (const point of points) {
        if (point.lat === null || point.lng === null) continue;
        any = true;
        bounds.extend([point.lng, point.lat]);

        const kindTheme = colorByKind[point.kind];
        const isSelected = selectedPointId === point.id;

        // Custom Pin Element
        const el = document.createElement("div");
        el.className = "group cursor-pointer relative";
        el.style.cssText = "transform: translate(-50%, -100%); transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);";

        const pinWrapper = document.createElement("div");
        pinWrapper.style.cssText = `
          display: flex;
          align-items: center;
          justify-content: center;
          width: ${isSelected ? "38px" : "32px"};
          height: ${isSelected ? "38px" : "32px"};
          background: ${kindTheme.bg};
          border: 2.5px solid #ffffff;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 4px 12px ${kindTheme.glow}, 0 2px 4px rgba(0,0,0,0.25);
          transition: all 0.25s ease;
        `;

        const iconContainer = document.createElement("div");
        iconContainer.style.cssText = "transform: rotate(45deg); display: flex; align-items: center; justify-content: center;";
        iconContainer.innerHTML = getIconSvg(point.kind);
        pinWrapper.appendChild(iconContainer);
        el.appendChild(pinWrapper);

        el.onmouseenter = () => {
          pinWrapper.style.transform = "rotate(-45deg) scale(1.18)";
          pinWrapper.style.zIndex = "50";
        };
        el.onmouseleave = () => {
          pinWrapper.style.transform = isSelected ? "rotate(-45deg) scale(1.1)" : "rotate(-45deg) scale(1)";
        };

        const tel = point.phone ? point.phone.replace(/\s/g, "") : null;
        const dir = `https://www.google.com/maps/dir/?api=1&destination=${point.lat},${point.lng}`;
        const dirStyle = isFr ? "direction:ltr;text-align:left;" : "direction:rtl;text-align:right;";
        const kindName = nameByKind[locale]?.[point.kind] ?? nameByKind.ar[point.kind];
        const wilayaText = isFr ? `Wilaya de ${esc(point.wilaya)}` : `ولاية ${esc(point.wilaya)}`;
        const statusText = getPointStatusLabel(point.status, locale);
        const verifyText = getVerificationLabel(point.verificationLevel, locale);
        const callBtnText = isFr ? "Appeler" : "اتصال";
        const dirBtnText = isFr ? "Itinéraire" : "الاتجاهات";

        const popupHtml = `
          <div style="font-family: inherit; ${dirStyle} min-width: 230px; max-width: 270px; padding: 4px 2px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <span style="display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 700; color: ${kindTheme.bg}; background: ${kindTheme.glow}; padding: 2px 8px; border-radius: 9999px;">
                ${kindName}
              </span>
              <span style="font-size: 10px; font-weight: 600; color: #64748b; background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">
                ${verifyText}
              </span>
            </div>
            
            <h4 style="margin: 0 0 4px; font-weight: 800; font-size: 15px; line-height: 1.3; color: #0f172a;">
              ${esc(point.name)}
            </h4>
            
            <p style="margin: 0 0 6px; color: #475569; font-size: 12px; display: flex; align-items: flex-start; gap: 4px;">
              <span style="color: #94a3b8;">📍</span> ${esc(point.commune)}، ${wilayaText}
            </p>
            
            ${point.address ? `<p style="margin: 0 0 6px; font-size: 11.5px; color: #64748b; background: #f8fafc; padding: 4px 6px; border-radius: 6px;">${esc(point.address)}</p>` : ""}
            
            ${point.openingHours ? `<p style="margin: 0 0 6px; font-size: 11.5px; color: #64748b; display: flex; align-items: center; gap: 4px;"><span>🕒</span> ${esc(point.openingHours)}</p>` : ""}
            
            <div style="display: flex; align-items: center; gap: 6px; margin: 8px 0 10px; font-size: 11px;">
              <span style="display: inline-flex; align-items: center; gap: 3px; font-weight: 600; color: #334155;">
                <span style="width: 6px; height: 6px; border-radius: 50%; background: ${point.status === "open" ? "#16a34a" : "#ea580c"};"></span>
                ${statusText}
              </span>
            </div>

            <div style="display: flex; gap: 6px; padding-top: 4px; border-top: 1px solid #e2e8f0;">
              ${
                tel
                  ? `<a href="tel:${esc(tel)}" style="flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 4px; text-align: center; background: #00843D; color: #ffffff; padding: 7px 10px; border-radius: 8px; text-decoration: none; font-size: 12px; font-weight: 700; box-shadow: 0 1px 2px rgba(0,0,0,0.08);">
                       📞 ${callBtnText}
                     </a>`
                  : ""
              }
              <a href="${dir}" target="_blank" rel="noopener noreferrer"
                 style="flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 4px; text-align: center; border: 1.5px solid #cbd5e1; background: #ffffff; color: #0f172a; padding: 6px 10px; border-radius: 8px; text-decoration: none; font-size: 12px; font-weight: 700;">
                🧭 ${dirBtnText}
              </a>
            </div>
          </div>`;

        const popup = new maplibregl.Popup({
          offset: 18,
          maxWidth: "290px",
          closeButton: true,
          closeOnClick: false,
        }).setHTML(popupHtml);

        const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
          .setLngLat([point.lng, point.lat])
          .setPopup(popup)
          .addTo(map);

        const handler = () => onSelectPoint?.(point);
        el.addEventListener("click", handler);

        markersRef.current.set(point.id, { marker, popup, point, el, handler });
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

  // Smooth camera flyTo when selectedPointId changes
  useEffect(() => {
    if (!selectedPointId || !mapRef.current) return;
    const target = markersRef.current.get(selectedPointId);
    if (target && target.point.lat !== null && target.point.lng !== null) {
      mapRef.current.flyTo({
        center: [target.point.lng, target.point.lat],
        zoom: 13,
        pitch: 25,
        essential: true,
        duration: 900,
      });
      target.marker.togglePopup();
    }
  }, [selectedPointId]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-border/80 shadow-md">
      <div ref={containerRef} className="h-full w-full" />

      {/* Floating Map Controls with Large Touch Targets */}
      <div className="absolute top-3 end-3 z-10 flex flex-col gap-1.5 rounded-2xl bg-background/95 p-1.5 shadow-xl backdrop-blur-md border border-border/80">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={handleLocateMe}
          title={isFr ? "Ma position (GPS)" : "تحديد موقعي الحالي (GPS)"}
          aria-label={isFr ? "Ma position" : "موقعي الحالي"}
          className="size-10 rounded-xl hover:bg-algeria-green/10 hover:text-algeria-green transition-colors active:scale-95"
        >
          <Locate className="size-5" />
        </Button>

        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={fitAll}
          title={isFr ? "Afficher toutes les zones" : "عرض كل النقاط في الجزائر"}
          aria-label={isFr ? "Afficher toutes les zones" : "عرض كل النقاط"}
          className="size-10 rounded-xl hover:bg-muted transition-colors active:scale-95"
        >
          <Maximize2 className="size-5" />
        </Button>

        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => setMapStyle((s) => (s === "standard" ? "humanitarian" : "standard"))}
          title={isFr ? "Changer le style de carte" : "تغيير نمط الخريطة"}
          aria-label={isFr ? "Changer le style de carte" : "تغيير نمط الخريطة"}
          className="size-10 rounded-xl hover:bg-muted transition-colors active:scale-95"
        >
          <Layers className="size-5" />
        </Button>
      </div>

      {userLocation && (
        <div className="absolute bottom-3 start-3 z-10 rounded-xl bg-background/95 px-3.5 py-2 text-xs font-bold text-algeria-green shadow-lg backdrop-blur-md border border-border/80 flex items-center gap-1.5 animate-in fade-in">
          <span className="inline-block size-2 rounded-full bg-algeria-green animate-ping" />
          <span>{isFr ? "Position GPS détectée" : "تم تحديد موقعك بدقة"}</span>
        </div>
      )}
    </div>
  );
}

