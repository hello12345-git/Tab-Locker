var background = function() {
    "use strict";
    var b, f;
    function T(t) {
        return t == null || typeof t == "function" ? {
            main: t
        } : t
    }
    const a = ((f = (b = globalThis.browser) == null ? void 0 : b.runtime) == null ? void 0 : f.id) == null ? globalThis.chrome : globalThis.browser
      , p = T( () => {
        const t = new Map
          , n = new Set;
        let u = null;
        const i = e => {
            try {
                return new URL(e).origin
            } catch {
                return e
            }
        }
        ;
        (async () => {
            const e = await a.storage.local.get(["pin", "lockedUrls"]);
            u = e.pin || null,
            e.lockedUrls && (e.lockedUrls.forEach(r => n.add(r)),
            (await a.tabs.query({})).forEach(r => {
                r.url && n.has(i(r.url)) && t.set(r.id, {
                    isLocked: !0,
                    url: r.url
                })
            }
            ))
        }
        )();
        const k = async () => {
            await a.storage.local.set({
                lockedUrls: Array.from(n)
            })
        }
          , h = async e => {
            const s = i(e);
            n.add(s),
            await k();
            const r = await a.tabs.query({});
            for (const o of r)
                if (o.url && i(o.url) === s) {
                    t.set(o.id, {
                        isLocked: !0,
                        url: o.url
                    }),
                    await a.action.setIcon({
                        tabId: o.id,
                        path: {
                            16: "icons/locked-16.png",
                            32: "icons/locked-32.png",
                            48: "icons/locked-48.png",
                            128: "icons/locked-128.png"
                        }
                    });
                    try {
                        await a.tabs.sendMessage(o.id, {
                            type: "LOCK_TAB"
                        })
                    } catch (c) {
                        console.error("Error sending lock message:", c)
                    }
                }
        }
          , E = async e => {
            const s = i(e);
            n.delete(s),
            await k();
            const r = await a.tabs.query({});
            for (const o of r)
                if (o.url && i(o.url) === s) {
                    t.delete(o.id);
                    try {
                        await a.tabs.sendMessage(o.id, {
                            type: "UNLOCK_TAB"
                        })
                    } catch (c) {
                        console.error("Error sending unlock message:", c)
                    }
                    await a.action.setIcon({
                        tabId: o.id,
                        path: {
                            16: "icons/unlocked-16.png",
                            32: "icons/unlocked-32.png",
                            48: "icons/unlocked-48.png",
                            128: "icons/unlocked-128.png"
                        }
                    })
                }
        }
        ;
        a.tabs.onUpdated.addListener(async (e, s, r) => {
            if (s.status === "complete" && r.url) {
                const o = i(r.url);
                if (n.has(o)) {
                    t.set(e, {
                        isLocked: !0,
                        url: r.url
                    });
                    try {
                        await a.tabs.sendMessage(e, {
                            type: "LOCK_TAB"
                        })
                    } catch (c) {
                        console.error("Error sending lock message:", c)
                    }
                }
            }
        }
        ),
        a.runtime.onMessage.addListener( (e, s, r) => {
            var o, c, w, y;
            try {
                switch (e.type) {
                case "SET_PIN":
                    u = e.pin,
                    a.storage.local.set({
                        pin: e.pin
                    }).then( () => {
                        r({
                            success: !0
                        })
                    }
                    );
                    break;
                case "VERIFY_PIN":
                    r({
                        isValid: e.pin === u
                    });
                    break;
                case "LOCK_TAB":
                    const d = e.tabId || ((o = s.tab) == null ? void 0 : o.id);
                    d ? a.tabs.get(d).then(m => {
                        m.url ? h(m.url).then( () => {
                            r({
                                success: !0
                            })
                        }
                        ) : r({
                            success: !1
                        })
                    }
                    ) : r({
                        success: !1
                    });
                    break;
                case "UNLOCK_TAB":
                    (c = s.tab) != null && c.url ? E(s.tab.url).then( () => {
                        r({
                            success: !0
                        })
                    }
                    ) : r({
                        success: !1
                    });
                    break;
                case "GET_TAB_STATE":
                    (w = s.tab) != null && w.id ? r({
                        isLocked: ((y = t.get(s.tab.id)) == null ? void 0 : y.isLocked) || !1
                    }) : r({
                        isLocked: !1
                    });
                    break;
                case "CHECK_PIN_SET":
                    r({
                        isPinSet: u !== null
                    });
                    break;
                default:
                    r({
                        success: !1
                    })
                }
            } catch (d) {
                console.error("Error in message handler:", d),
                r({
                    success: !1,
                    error: "Internal error"
                })
            }
            return !0
        }
        ),
        a.commands.onCommand.addListener(async e => {
            var s;
            if (e === "lock-tab") {
                const r = await a.tabs.query({
                    active: !0,
                    currentWindow: !0
                });
                if ((s = r[0]) != null && s.id) {
                    const o = r[0].id;
                    o && a.tabs.get(o).then(c => {
                        c.url && h(c.url)
                    }
                    )
                }
            }
        }
        )
    }
    );
    function I() {}
    function l(t, ...n) {}
    const L = {
        debug: (...t) => l(console.debug, ...t),
        log: (...t) => l(console.log, ...t),
        warn: (...t) => l(console.warn, ...t),
        error: (...t) => l(console.error, ...t)
    };
    let g;
    try {
        g = p.main(),
        g instanceof Promise && console.warn("The background's main() function return a promise, but it must be synchronous")
    } catch (t) {
        throw L.error("The background crashed on startup!"),
        t
    }
    return g
}();
background;
