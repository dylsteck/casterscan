import type { NFTDData } from '~/types/nftd.t';
import nftdIcon from '../../public/nftdIcon.png';
import Image from 'next/image';

interface NFTDPopupProps{
    nftdData: NFTDData[];
    handleClose: () => void;
}

const PopupRow = ({ nftd }: { nftd: NFTDData }) => {
    console.log(nftd);
    return(
        <div>

        </div>
    )
}

export function NFTDPopup({ nftdData, handleClose }: NFTDPopupProps){
    return(
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-[#f9f9f9]/85 p-8 rounded-lg shadow-lg w-[75%]">
                <div>
                    <Image 
                        src={nftdIcon}
                        width={100/1.3} height={43/1.3} alt="NF.TD icon" 
                        className="pl-4 pt-2 pb-5 float-left"
                    />
                    <p onClick={handleClose}>close</p>
                </div>
                {nftdData.map((nftd: NFTDData) => {
                    return <PopupRow nftd={nftd} />
                })}
            </div>
        </div>
    )
};