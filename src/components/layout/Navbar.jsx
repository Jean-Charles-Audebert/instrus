import {useEffect, useRef, useState} from "react";
import {Link, useNavigate, Outlet} from "react-router-dom";
import {signOut} from "firebase/auth";
import {auth} from "../../config/firebase";
import "./Navbar.css";

const Navbar = ({ onSearch }) => {
    const navigate = useNavigate();
    const menuRef = useRef(null);
    const buttonRef = useRef(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target)
            ) {
                setMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);


    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        onSearch(event.target.value);
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate("instrus/");
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    return (
        <>
            <button
                ref={buttonRef}
                className="menu-button"
                aria-label="Ouvrir le menu"
                aria-expanded={menuOpen}
                aria-controls="nav-menu"
                onClick={() => setMenuOpen((prev) => !prev)}
            >
                &#9776;
            </button>

            <nav
                className={`nav ${menuOpen ? "open" : ""}`}
                ref={menuRef}
                id="nav-menu"
                role="navigation"
                aria-label="Menu principal"
            >
                <ul>
                    <li><Link to="instrus/players">Joueurs</Link></li>
                    <li><Link to="instrus/instruments">Instruments</Link></li>
                    <li><Link to="instrus/lightstock">Stock Lumières</Link></li>
                    {/*<li><Link to="instrus/tripods">Trépieds</Link></li>*/}
                    {/*<li><Link to="instrus/loans">Prêts</Link></li>*/}

                    <li>
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </li>
                    <li>
                        <button onClick={handleLogout}>Logout</button>
                    </li>
                </ul>
            </nav>
            <Outlet />
        </>
    )
        ;
};

export default Navbar;
