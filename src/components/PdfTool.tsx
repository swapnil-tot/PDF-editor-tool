import React, { useEffect, useRef, useState } from 'react'
import { Accordion, AccordionSummary } from '@mui/material';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import * as pdfjsLib from "pdfjs-dist";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import { PDFDocument } from "pdf-lib";
import rotateLeft from "../assets/images/rotate-left.svg";
import rotateRight from "../assets/images/rotate-right.svg";
import crop from "../assets/images/crop.svg";

type PdfToolTypes = {
  pdfData: any,
  pdfFile: string,
  oldPdf: string
}
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.mjs`;

const PdfTool = ({ pdfData, pdfFile, oldPdf }: PdfToolTypes) => {
  const containerRef = useRef<any>(null);
  const [cropperMaxHeight, setCropperMaxHeight] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<string | false>("");
  const [selectedPage, setSelectedPage] = useState<any>(0);
  const [rotationAngles, setRotationAngles] = useState<any>([]);
  const [pageImages, setPageImages] = useState<any>([]);
  const cropperRef = useRef<any>(null);
  const [pages, setPages] = useState<any>([]);
  const DragDropContent = DragDropContext as any;
  const DropComponent = Droppable as any;
  const DragComponent = Draggable as any;
  const CropperComponent = Cropper as any;

  const handleChange: any =
    (panel: string) =>
      (newExpanded: boolean) => {
        setExpanded(newExpanded ? panel : false);
      };

  useEffect(() => {
    const updateCropperMaxHeight = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const maxHeight = containerWidth * 0.8;
        setCropperMaxHeight(maxHeight);
      }
    };
    updateCropperMaxHeight();
    getFile(pdfFile);
    window.addEventListener('resize', updateCropperMaxHeight);
    return () => {
      window.removeEventListener('resize', updateCropperMaxHeight);
    };
  }, []);

  const rotateSelectedPage = async (angle: any) => {
    const newRotationAngles: any = [...rotationAngles];
    newRotationAngles[selectedPage] =
      (newRotationAngles[selectedPage] + angle) % 360;
    setRotationAngles(newRotationAngles);
    if (newRotationAngles[selectedPage] < 0) {
      newRotationAngles[selectedPage] += 360;
    }
    setRotationAngles(newRotationAngles);
    const response = await fetch(oldPdf);
    const arrayBuffer = await response.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(selectedPage + 1);
    const viewport = page.getViewport({ scale: 1.5, rotation: newRotationAngles[selectedPage] });
    const canvas = document.createElement("canvas");
    const context: any = canvas.getContext("2d");
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    await page.render({ canvasContext: context, viewport }).promise;
    const rotatedImage = canvas.toDataURL();
    const newPageImages = [...pageImages];
    newPageImages[selectedPage] = rotatedImage;
    setPageImages(newPageImages)
  };

  const handleCrop = () => {
    if (cropperRef?.current) {
      const cropper: any = cropperRef?.current.cropper;
      const croppedDataUrl = cropper.getCroppedCanvas().toDataURL();
      const newPageImages = [...pageImages];
      newPageImages[selectedPage] = croppedDataUrl;
      setPageImages(newPageImages);
    }
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const reorderedPages = Array.from(pages);
    const [removed] = reorderedPages.splice(result.source.index, 1);
    reorderedPages.splice(result.destination.index, 0, removed);
    setPages(reorderedPages);
  };

  const renderPdfPages = async (arrayBuffer: any, pageCount: number) => {
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const images = [];
    for (let i = 1; i <= pageCount; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement("canvas");
      const context: any = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      await page.render({ canvasContext: context, viewport }).promise;
      images.push(canvas.toDataURL());
    }
    setPageImages(images);
  };

  const getFile = async (pdfFile: string) => {
    try {
      const response = await fetch(pdfFile);
      const arrayBuffer = await response.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pageCount = pdfDoc.getPageCount();
      setPages(Array.from({ length: pageCount }, (_, i) => i));
      setRotationAngles(Array(pageCount).fill(0));
      await renderPdfPages(arrayBuffer, pageCount);
    } catch (error: any) {
      console.log("🚀 ~ getFile ~ error:", error)
    }
  };


  return (
    <div className="croporganize-layout flex flex-col lg:flex-row gap-5 mt-12 max-h-full lg:max-h-[670px] lg:overflow-y-auto no-scrollbar overflow-hidden">
      <div className='basis-[33%] bg-white border-[2px] border-[#C3CCD5] rounded-[8px] p-4 max-h-[650px] overflow-y-scroll no-scrollbar'>
        <label className='font-bold text-[16px] md:text-[18px]'>Document</label>
        <hr className='my-5' />
        {pdfData && pdfData?.length > 0 &&
          pdfData?.map((item: any, index: number) =>
            <Accordion
              className="mt-3"
              expanded={expanded === `panel${index}`}
              onChange={handleChange(`panel${index}`)}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`panel${index}-content`}
                id={`panel${index}-header`}
                className="text-[#0B0D0F] text-[14px] flex justify-between gap-2"
              >
                <label className="w-1/2 text-[#0B0D0F] font-semibold truncate">
                  {item.pdfName}
                </label>
                <label className="w-1/2 text-[#0B0D0F] font-semibold">
                  {item.pageCount}
                </label>
              </AccordionSummary>
              <DragDropContent onDragEnd={onDragEnd}>
                <div className="p-2 xl:p-4">
                  <DropComponent droppableId={`pages`}>
                    {(provided: any) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="flex flex-col gap-1 pages"
                      >
                        {pages.slice(item.startFrom, item.pageCount + item.startFrom).map((pageIndex: number) =>
                        (
                          <DragComponent
                            key={pageIndex}
                            draggableId={`page-${pageIndex}`}
                            index={pageIndex}
                          >
                            {(provided: any) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => {
                                  setSelectedPage(pageIndex);
                                }}
                                style={{
                                  userSelect: "none",
                                  padding: "8px",
                                  margin: "0 0 8px 0",
                                  minHeight: "50px",
                                  backgroundColor: "#fff",
                                  color: "#333",
                                  border: "1px solid #ddd",
                                  ...provided.draggableProps.style,
                                }}
                              >
                                Document {pageIndex + 1}
                              </div>
                            )}
                          </DragComponent>
                        ))
                        }
                        {provided.placeholder}
                      </div>
                    )}
                  </DropComponent>
                </div>
              </DragDropContent>
            </Accordion>
          )
        }
      </div>
      <div className='basis-[33%] bg-white border-[2px] border-[#C3CCD5] rounded-[8px] p-4 flex flex-col max-h-[650px] overflow-y-scroll no-scrollbar' ref={containerRef}>
        <div className='flex flex-col justify-between'>
          <div className='crop-component' style={{ maxWidth: '100%' }}>
            {selectedPage === 0 ?
              <div className='mt-5'>
                <CropperComponent
                  src={pageImages[0]}
                  guides={false}
                  ref={cropperRef}
                  aspectRatio={0}
                  initialAspectRatio={0}
                  style={{
                    maxWidth: '100%',
                    width: '100%',
                    maxHeight: cropperMaxHeight ? `${cropperMaxHeight}px` : 'auto',
                    // transform: `rotate(${rotationAngles[0]}deg)`,
                  }}
                />
              </div> :
              <div className='mt-5'>
                <CropperComponent
                  src={pageImages[selectedPage]}
                  guides={false}
                  ref={cropperRef}
                  aspectRatio={0}
                  initialAspectRatio={0}
                  style={{
                    maxWidth: '100%',
                    width: '100%',
                    maxHeight: cropperMaxHeight ? `${cropperMaxHeight}px` : 'auto',
                    // transform: `rotate(${rotationAngles[selectedPage]}deg)`,
                  }}
                />
              </div>
            }
          </div>
          <div className='buttons flex gap-2 justify-center mt-10'>
            <img src={rotateLeft} alt="rotate-left" className='h-10 w-10 cursor-pointer'
              onClick={() => {
                rotateSelectedPage(90)
              }} />
            <img src={rotateRight} alt="rotate-right" className='h-10 w-10 cursor-pointer'
              onClick={() => {
                rotateSelectedPage(-90)
              }}
            />
            <img src={crop} alt="crop" className='h-10 w-10 cursor-pointer'
              onClick={() => {
                handleCrop()
              }}
            />
          </div>
        </div>
      </div>
      <div className='basis-[33%] bg-white border-[2px] border-[#C3CCD5] rounded-[8px] p-4 max-h-[650px] overflow-y-scroll no-scrollbar'>
        {pages.map((pageIndex: number) => (
          <div
            key={pageIndex}
            style={{
              padding: "8px",
              margin: "10px 8px",
              minHeight: "50px",
            }}
          >
            <img
              src={pageImages[pageIndex]}
              alt={`Page ${pageIndex + 1}`}
              style={{
                width: "500px",
                // transform: `rotate(${rotationAngles[pageIndex]}deg)`,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default PdfTool