import Link from "next/link";

export default function Footer() {
    return (
        <footer className="relative w-full mt-12 md:mt-20">
            <div className="w-full relative">
                <img
                    src="/images/footer.png"
                    alt="Footer"
                    className="w-full h-auto object-cover"
                />

                {/* INVISIBLE CLICKABLE AREAS */}
                <div className="absolute inset-0 z-10 flex flex-col justify-between px-4 md:px-12 py-4 md:py-8">

                    {/* Top Area: Phones (Left) and Address/Email (Right) */}
                    <div className="flex flex-row justify-between w-full h-[70%]">
                        {/* LEFT: Phone Numbers Area */}
                        <div className="w-[45%] h-full flex flex-col justify-center gap-2">
                            <a href="tel:+919106048805" className="block w-full h-[30px] opacity-0 cursor-pointer" title="Call Mrugesh">Call</a>
                            <a href="tel:+917990755212" className="block w-full h-[30px] opacity-0 cursor-pointer" title="Call Prince">Call</a>
                            <a href="tel:+916355054101" className="block w-full h-[30px] opacity-0 cursor-pointer" title="Call Tanisha">Call</a>
                        </div>

                        {/* RIGHT: Address & Email Area */}
                        <div className="w-[45%] h-full flex flex-col items-end justify-center gap-2">
                            <a href="https://maps.google.com" target="_blank" className="block w-full h-[60%] opacity-0 cursor-pointer" title="Address">Address</a>
                            <a href="mailto:synapse@daiict.ac.in" className="block w-full h-[20%] opacity-0 cursor-pointer" title="Email">Email</a>
                        </div>
                    </div>
                    <div className="w-full h-[20%] flex justify-center items-end gap-6 md:gap-12">
                        <Link href="https://facebook.com" className="w-[40px] h-[40px] opacity-0 cursor-pointer" title="Facebook">FB</Link>
                        <Link href="https://instagram.com" className="w-[40px] h-[40px] opacity-0 cursor-pointer" title="Instagram">IG</Link>
                        <Link href="https://youtube.com" className="w-[40px] h-[40px] opacity-0 cursor-pointer" title="YouTube">YT</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
